(function () {
  var localVideoElem = null,
    localVideoStream = null,
    startButton = null,
    endButton = null;

  var wsConn = new WebSocket(config.wssHost),
    peerConn = null,
    peerConnCfg = {
      'iceServers': [
        {'url': 'stun:stun.services.mozilla.com'},
        {'url': 'stun:stun.l.google.com:19302'}
      ]
    };

  var desktopOptions = null,
    desktopOptionsTemplate = {
      chrome: {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'screen',
            maxWidth: 1280,
            maxHeight: 720
          },
          optional: []
        }
      },
      standard: {
        audio: false,
        video: {
          mediaSource: config.screenSharingMode, // 'screen' || 'window' || 'application'
          maxWidth: 1280,
          maxHeight: 720
        }
      }
    };

  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
  window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

  if (!navigator.getUserMedia || !window.RTCPeerConnection || !window.RTCIceCandidate || !window.RTCSessionDescription) {
    alert('Browser not supported. Please, try with Google Chrome or Firefox on their last versions');
    return;
  }

  function initialize () {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
      desktopOptions = desktopOptionsTemplate.chrome;
    } else {
      desktopOptions = desktopOptionsTemplate.standard;
    }

    startButton = document.getElementById('shareBtn');
    endButton = document.getElementById('stopBtn');
    localVideoElem = document.getElementById('desktop');

    startButton.addEventListener('click', initSharing);
    endButton.addEventListener('click', endSharing);
  }

  function initSharing () {
    peerConn = new RTCPeerConnection(peerConnCfg);
    peerConn.addEventListener('icecandidate', onIceCandidateHandler);

    navigator.getUserMedia(desktopOptions, function (stream) {
      localVideoStream = stream;
      localVideoElem.src = URL.createObjectURL(localVideoStream);
      peerConn.addStream(localVideoStream);
      createAndSendOffer();
    }, function (error) { console.log(error); });
  }

  function endSharing () {
    wsConn.send(JSON.stringify({ closeConnection: true }));

    peerConn.close();
    peerConn = null;
    startButton.classList.remove('hide');
    endButton.classList.add('hide');

    if (localVideoStream) {
      localVideoStream.getTracks().forEach(function (track) {
        track.stop();
      });
      localVideoElem.src = '';
    }
  }

  wsConn.onmessage = function (e) {
    var message = JSON.parse(e.data);
    if (message.sdp) {
      peerConn.setRemoteDescription(new RTCSessionDescription(message.sdp));
    } else if (message.candidate) {
      peerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  };

  function createAndSendOffer () {
    peerConn.createOffer(
      function (offer) {
        var rtcSessionDesc = new RTCSessionDescription(offer);
        peerConn.setLocalDescription(new RTCSessionDescription(rtcSessionDesc),
          function () {
            wsConn.send(JSON.stringify({ sdp: rtcSessionDesc }));
          },
          function (error) { console.log(error); }
        );
      },
      function (error) { console.log(error); }
    );
  }

  function onIceCandidateHandler (e) {
    if (!e || !e.candidate) return;
    wsConn.send(JSON.stringify({ candidate: e.candidate }));
    startButton.classList.add('hide');
    endButton.classList.remove('hide');
  }

  initialize();
})();

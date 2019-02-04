(function () {
  var localVideoElem = null,
    remoteVideoElem = null,
    localVideoStream = null;

  var wsConn = new WebSocket(config.wssHost),
    peerConn = null,
    peerConnCfg = {
      'iceServers': [
        {'url': 'stun:stun.services.mozilla.com'},
        {'url': 'stun:stun.l.google.com:19302'}
      ]
    };

  var videoOptions = {
    audio: false,
    video: true
  };

  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
  window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

  function initialize () {
    localVideoElem = document.getElementById('webcam');
    remoteVideoElem = document.getElementById('desktop');
  }

  function startStream () {
    peerConn = new RTCPeerConnection(peerConnCfg);
    peerConn.addEventListener('icecandidate', onIceCandidateHandler);
    peerConn.addEventListener('addstream', onAddStreamHandler);

    navigator.getUserMedia(videoOptions, function (stream) {
      localVideoStream = stream;
      localVideoElem.srcObject = localVideoStream;
      createAndSendAnswer();
    }, function (error) { console.log(error); });
  }

  function stopStreaming () {
    peerConn.close();
    peerConn = null;
    if (localVideoStream) {
      localVideoElem.src = '';
      localVideoElem.classList.add('hide');
    }
    if (remoteVideoElem) {
      remoteVideoElem.srcObject = localVideoStream;
    }
  }

  wsConn.onmessage = function (e) {
    if (!peerConn) startStream();
    var message = JSON.parse(e.data);
    if (message.sdp) {
      peerConn.setRemoteDescription(new RTCSessionDescription(message.sdp));
    } else if (message.candidate) {
      peerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
    } else if (message.closeConnection) {
      stopStreaming();
    }
  };

  function createAndSendAnswer () {
    peerConn.createAnswer(
      function (answer) {
        var rtcSessionDesc = new RTCSessionDescription(answer);
        peerConn.setLocalDescription(
          rtcSessionDesc,
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
  }

  function onAddStreamHandler (e) {
    remoteVideoElem.srcObject = e.stream;
    if (localVideoStream) {
      localVideoElem.srcObject = localVideoStream;
      localVideoElem.classList.remove('hide');
    }
  }

  initialize();
})();

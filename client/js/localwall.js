(function(){
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
          mediaSource: 'window', // 'screen' || 'window' || 'application'
          maxWidth: 1280,
          maxHeight: 720
        }
      }
    },
    webcamOptions = {
      audio: false,
      video: true
    };

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  if (!navigator.getUserMedia){
    return alert('getUserMedia not supported in this browser.');
  }

  if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
    desktopOptions = desktopOptionsTemplate.chrome;
  } else {
    desktopOptions = desktopOptionsTemplate.standard;
  }

  navigator.getUserMedia(desktopOptions, onDesktopStream, function(e) {
    console.log(e);
  });

  function onDesktopStream(stream) {
    var video = document.querySelector("#desktop");
    video.src = window.URL.createObjectURL(stream);
  }

  navigator.getUserMedia(webcamOptions, onWebcamStream, function(e) {
    console.log(e);
  });

  function onWebcamStream(stream){
    var video = document.querySelector("#webcam");
    video.src = window.URL.createObjectURL(stream);
  };

})();

function setVideoStream($video, stream){
  // ref: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
  try {
    $video.srcObject = stream;
  } catch (error) {
    $video.src = window.URL.createObjectURL(stream);
  }
}
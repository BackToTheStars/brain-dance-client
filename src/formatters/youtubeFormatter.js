/* 
Функция преобразования адреса видео youtube, чтобы оно нормально проигрывалось в плеере youtube 
добавляет строку "embed/"

Варианты адресов:
    https://www.youtube.com/embed/Lo9SOZr5aQU
    https://www.youtube.com/watch?v=Lo9SOZr5aQU
    https://youtu.be/Lo9SOZr5aQU

*/

function youtubeFormatter(videoAddress) {
  let dataMatched;
  if (videoAddress.indexOf('/embed/') !== -1) {
    return videoAddress.slice(videoAddress.lastIndexOf('/embed/') + 7);
    // dataMatched = videoAddress.match(
    //   /\/embed\/(?<videoHash>[a-zA-Z0-9-_]*)(\?[\^ ]*(start=(?<startTime>(?<startSeconds>[0-9]+)|)|)&(end=(?<endTime>[0-9]+|))|)/
    // );
  } else if (videoAddress.indexOf('?v=') !== -1) {
    return videoAddress.slice(videoAddress.lastIndexOf('?v=') + 3);
    // dataMatched = videoAddress.match(
    //   /\?v=(?<videoHash>[a-zA-Z0-9-_]*)(&[\^ ]*(t=(?<startTime>(?<startHours>[0-9]+h|)(?<startMinutes>[0-9]+m|)(?<startSeconds>[0-9]+(s|))|)|)|)/
    // );
  }
  //   if (!dataMatched) {
  console.log(`Incorrect youtube url: ${videoAddress}`);
  return '';
  //   } else {
  //       let startSeconds = '';
  // if (dataMatched.groups.startTime !== dataMatched.groups.startSeconds) {
  //     startSeconds = dataMatched.groups.startSeconds.slice(0, -1); // 's' postfix
  // }
  //     return `https://www.youtube.com/embed/${dataMatched.groups.videoHash}?${dataMatched.groups.startTime ? dataMatched.groups.startTime}`;
  //   }

  // https://www.youtube.com/embed/fxc3Tv3tV7M

  // const address = videoAddress.slice(videoAddress.lastIndexOf('?v=') + 3);

  // return address;
}

export { youtubeFormatter };

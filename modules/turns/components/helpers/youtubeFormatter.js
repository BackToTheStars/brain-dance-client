/* 
Функция преобразования адреса видео youtube, чтобы оно нормально проигрывалось в плеере youtube 
добавляет строку "embed/"

Варианты адресов:
    https://www.youtube.com/embed/Lo9SOZr5aQU
    https://www.youtube.com/watch?v=Lo9SOZr5aQU
    https://www.youtube.com/watch?v=SB1W4il3eH8&ab_channel=PeterBence 
    https://youtu.be/Lo9SOZr5aQU
    https://youtu.be/SB1W4il3eH8?t=49    
*/

function youtubeFormatterOld(videoAddress) {
  let videoHash;
  let startTime;
  let endTime;
  if (videoAddress.indexOf('/embed/') !== -1) {
    //return videoAddress.slice(videoAddress.lastIndexOf('/embed/') + 7);
    videoHash = videoAddress.match(/\/embed\/(?<videoHash>[a-zA-Z0-9-_]*)/);
    videoHash = videoHash && videoHash.groups.videoHash;
    const params = new URLSearchParams(videoAddress);
    startTime = +params.get('start');
    endTime = params.get('end');
  } else if (videoAddress.indexOf('?v=') !== -1) {
    //return videoAddress.slice(videoAddress.lastIndexOf('?v=') + 3);
    videoHash = videoAddress.match(/\?v=(?<videoHash>[a-zA-Z0-9-_]*)/);
    videoHash = videoHash && videoHash.groups.videoHash;
    const params = new URLSearchParams(videoAddress);
    startTime = params.get('t') || params.get('start');
    if (startTime) {
      const h = startTime.match(/[0-9]+(?=h)/);
      const m = startTime.match(/[0-9]+(?=m)/);
      const s =
        startTime.match(/[0-9]+(?=s)/) || startTime.match(/(?=[\^0-9])[0-9]+$/);
      startTime =
        0 + (h ? h[0] * 3600 : 0) + (m ? m[0] * 60 : 0) + (s ? s[0] : 0);
    }
  }
  if (videoHash) {
    const subUrl = `${videoHash}?start=${startTime ? startTime : 0}${
      endTime ? '&end=' + endTime : ''
    }`;
    const selfProps = {
      fullUrl: `https://www.youtube.com/embed/${subUrl}`,
      subUrl,
      toString: () => subUrl,
    };
    let res = new String();
    Object.assign(res, selfProps);
    return res;
  } else {
    console.log(`Incorrect youtube url: ${videoAddress}`);
    return '';
  }
}

/*
 *  Варианты адресов:
    https://www.youtube.com/watch?v=Lo9SOZr5aQU
 */
function youtubeFormatter(videoAddress) {
  const splited = videoAddress.split('=');
  return splited[1];
}

export { youtubeFormatter };

import { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import { youtubeFormatter } from '../helpers/formatters/youtubeFormatter';

let timeoutId;
const Video = ({ videoUrl, registerHandleResize, width }) => {
  const videoEl = useRef(null);
  let newVideoUrl = '';
  const [newWidth, setNewWidth] = useState(width);

  // console.log({ width });
  useEffect(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // if (width !== newWidth) {
      setNewWidth(width);
      // }
    }, 100);
  }, [width]);

  if (videoUrl.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    // @todo videoFormatter()
    newVideoUrl = youtubeFormatter(videoUrl);
  } else {
    console.log(`Unknown video source: "${videoUrl}"`);
  }

  useEffect(() => {
    registerHandleResize({
      type: 'video',
      id: 'video',
      minWidthCallback: () => {
        return 20;
      },
      minHeightCallback: (newWidth) => {
        const newImgHeight = Math.floor((9 * newWidth) / 16);
        return newImgHeight;
      },
      maxHeightCallback: (newWidth) => {
        const newImgHeight = Math.floor((9 * newWidth) / 16);
        return newImgHeight;
      },
    });
  }, []);

  return (
    <div
      style={{
        width: newWidth,
        height: Math.floor((9 * newWidth) / 16),
      }}
      className="video"
      ref={videoEl}
    >
      <YouTube
        videoId={newVideoUrl}
        onReady={
          () => {}
          // setTimeout(() => {
          //   // @todo: убедиться, что iframe не только "готов", но и отрисован
          //   handleResize();
          // }, 1000)
        }
        opts={{
          width: '100%',
          height: '100%',
        }}
      ></YouTube>
    </div>
  );
};

export default Video;

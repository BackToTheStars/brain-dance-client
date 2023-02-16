import { isDevMode } from '@/config/mode';
import { widgetSpacer } from '@/config/ui';
import { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import { youtubeFormatter } from '../helpers/youtubeFormatter';

let timeoutId;
const Video = ({ videoUrl, registerHandleResize, width }) => {
  const videoEl = useRef(null);
  let newVideoUrl = '';
  const [newWidth, setNewWidth] = useState(width);

  // console.log({ width });
  useEffect(() => {
    // clearTimeout(timeoutId);
    // timeoutId = setTimeout(() => {
    if (width !== newWidth) {
      setNewWidth(width);
    }
    // }, 100);
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
      id: 'video1',
      minWidthCallback: () => {
        return 20;
      },
      minHeightCallback: (newWidth) => {
        const newImgHeight =
          Math.floor((9 * (newWidth - 2 * widgetSpacer)) / 16) + widgetSpacer;
        return newImgHeight;
      },
      maxHeightCallback: (newWidth) => {
        const newImgHeight =
          Math.floor((9 * (newWidth - 2 * widgetSpacer)) / 16) + widgetSpacer;
        return newImgHeight;
      },
    });
  }, []);

  return (
    <div
      style={{
        width: newWidth,
        height:
          Math.floor((9 * (newWidth - 2 * widgetSpacer)) / 16) + widgetSpacer,
      }}
      className="video"
      ref={videoEl}
    >
      {isDevMode ? (
        <img
          src={`https://img.youtube.com/vi/${newVideoUrl}/0.jpg`}
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      ) : (
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
        />
      )}
    </div>
  );
};

export default Video;

import { isDevMode } from '@/config/mode';
import { widgetSpacer } from '@/config/ui';
import { useEffect, useState, useRef, useMemo } from 'react';
import YouTube from 'react-youtube';
import { youtubeFormatter } from '../helpers/youtubeFormatter';
import { useSelector } from 'react-redux';

let timeoutId;
const Video = ({ registerHandleResize, turnId, widgetId }) => {
  const videoEl = useRef(null);
  // const [newWidth, setNewWidth] = useState(width);
  const width = useSelector((state) => state.turns.d[turnId].size.width);
  const videoUrl = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId].url
  );
  const newVideoUrl = useMemo(() => {
    if (videoUrl.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
      // @todo videoFormatter()
      return youtubeFormatter(videoUrl);
    } else {
      console.log(`Unknown video source: "${videoUrl}_${turnId}"`);
    }
  }, [videoUrl]);

  // console.log({ width });
  // useEffect(() => {
  //   // clearTimeout(timeoutId);
  //   // timeoutId = setTimeout(() => {
  //   if (width !== newWidth) {
  //     setNewWidth(width);
  //   }
  //   // }, 100);
  // }, [width]);

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
        width: `${width}px`,
        height: `${
          Math.floor((9 * (width - 2 * widgetSpacer)) / 16) + widgetSpacer
        }px`,
      }}
      className="video turn-widget"
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

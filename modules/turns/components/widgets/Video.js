import { widgetSpacer } from '@/config/ui';
import { useEffect, useState, useRef, useMemo } from 'react';
import YouTube from 'react-youtube';
import { youtubeFormatter } from '../helpers/youtubeFormatter';
import { useSelector } from 'react-redux';
import { PlayCircleFilled } from '@ant-design/icons';
import { WIDGET_VIDEO } from '../../settings';

const Video = ({
  registerHandleResize,
  unregisterHandleResize,
  turnId,
  widgetId,
}) => {
  const [previewMode, setPreviewMode] = useState(true);
  const videoEl = useRef(null);
  const width = useSelector((state) => state.turns.g[turnId].size.width);
  const videoUrl = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId].url,
  );
  const newVideoUrl = useMemo(() => {
    if (videoUrl.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
      // @todo videoFormatter()
      return youtubeFormatter(videoUrl);
    } else {
      console.log(`Unknown video source: "${videoUrl}_${turnId}"`);
    }
  }, [videoUrl]);

  useEffect(() => {
    registerHandleResize({
      type: WIDGET_VIDEO,
      id: widgetId,
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
    return () => unregisterHandleResize({ id: widgetId });
  }, []);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${
          Math.floor((9 * (width - 2 * widgetSpacer)) / 16) + widgetSpacer
        }px`,
      }}
      className="video turn-widget relative"
      ref={videoEl}
    >
      {previewMode ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={`https://img.youtube.com/vi/${newVideoUrl}/0.jpg`}
            style={{
              display: 'block',
              objectFit: 'cover',
              objectPosition: 'center',
              width: '100%',
              height: '100%',
            }}
          />
          <PlayCircleFilled
            className="video__play"
            onClick={() => {
              setPreviewMode(false);
            }}
          />
        </div>
      ) : (
        <YouTube
          videoId={newVideoUrl}
          // onReady={() => {}}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: true,
              rel: '0',
            },
          }}
        />
      )}
    </div>
  );
};

export default Video;

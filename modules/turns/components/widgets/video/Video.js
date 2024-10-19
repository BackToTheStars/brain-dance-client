import { widgetSpacer } from '@/config/ui';
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PlayCircleFilled } from '@ant-design/icons';
import { WIDGET_VIDEO } from '../../../settings';
import { STATIC_MEDIA_URL } from '@/config/server';
// import YoutubeVideo from './Youtube';
import MediaVideo from './Media';

const mediaServerUrls = [STATIC_MEDIA_URL];

const Video = ({
  registerHandleResize,
  unregisterHandleResize,
  turnId,
  widgetId,
}) => {
  const width = useSelector((state) => state.turns.g[turnId].size.width);
  const video = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId],
  );
  const [previewMode, setPreviewMode] = useState(true);

  const { previewImg, platform, videoId } = useMemo(() => {
    const videoUrl = video?.url;
    if (!videoUrl) return {};
    if (videoUrl.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
      const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').at(-1);
      return {
        previewImg: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        platform: 'youtube',
        videoId,
      };
    }
    for (const mediaServerUrl of mediaServerUrls) {
      if (videoUrl.startsWith(mediaServerUrl)) {
        // const innerPath = videoUrl.replace(mediaServerUrl, '');
        // const videoId = innerPath.split('/').at(-1);
        return {
          // previewImg: `${mediaServerUrl}/preview/${videoId}`,
          previewImg: video?.preview || '/img/video-default.png',
          platform: 'media-server',
          videoId: videoUrl,
        };
      }
    }
    return {
      previewImg: null,
      platform: 'local',
      videoId: videoUrl,
    };
  }, [video]);

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
            // src={`https://img.youtube.com/vi/${newVideoUrl}/0.jpg`}
            src={previewImg}
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
        <>
          {/* {platform === 'youtube' && <YoutubeVideo videoId={videoId} />} */}
          {platform === 'youtube' && <MediaVideo videoUrl={video.url} />}
          {platform === 'media-server' && <MediaVideo videoUrl={videoId} />}
          {platform === 'local' && <div>Local Video {videoId}</div>}
          {platform === 'unknown' && <div>Unknown Video {videoId}</div>}
        </>
      )}
    </div>
  );
};

export default Video;

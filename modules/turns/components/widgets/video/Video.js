import { widgetSpacer } from '@/config/ui';
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PlayCircleFilled } from '@ant-design/icons';
import { WIDGET_VIDEO } from '../../../settings';
import {
  getYoutubeVideoId,
  getYoutubePreviewUrl,
} from '../../helpers/videoUrl';
import MediaVideo from './Media';
import { TID } from '@/config/testIds';

const DEFAULT_PREVIEW = '/img/video-default.png';

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

  // YouTube — превью с img.youtube.com; всё остальное (медиа-сервер, прямые
  // ссылки) react-player играет по URL как есть, превью — из виджета или дефолт
  const previewImg = useMemo(() => {
    const videoUrl = video?.url;
    if (!videoUrl) return DEFAULT_PREVIEW;
    const youtubeId = getYoutubeVideoId(videoUrl);
    if (youtubeId) return getYoutubePreviewUrl(youtubeId);
    return video?.preview || DEFAULT_PREVIEW;
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
            src={previewImg}
            alt=""
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(DEFAULT_PREVIEW)) {
                e.currentTarget.src = DEFAULT_PREVIEW;
              }
            }}
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
            data-test-id={TID.media.preview}
            data-turn-id={turnId}
            onClick={() => {
              setPreviewMode(false);
            }}
          />
        </div>
      ) : (
        <MediaVideo videoUrl={video.url} turnId={turnId} widgetId={widgetId} />
      )}
    </div>
  );
};

export default Video;

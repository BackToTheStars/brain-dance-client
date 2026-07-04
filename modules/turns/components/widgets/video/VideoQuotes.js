import { WIDGET_VIDEO_QUOTES } from '@/modules/turns/settings';
import { updateVideoQuotesWidget } from '@/modules/turns/redux/actions';
import { MODE_WIDGET_VIDEO_QUOTES_MANAGE } from '@/config/panel';
import { TYPE_QUOTE_VIDEO } from '@/modules/quotes/settings';
import { useMediaPlaybackState } from '../media/PlaybackContext';
import TimelineQuotes from '../timeline/Quotes';

const VideoQuotes = ({
  turnId,
  widgetId,
  mediaWidgetId = 'v_1',
  registerHandleResize,
  unregisterHandleResize,
}) => {
  // живое состояние парного видеоплеера (v_1) из PlaybackContext
  const { progress, playing, togglePlay } =
    useMediaPlaybackState(mediaWidgetId);

  return (
    <TimelineQuotes
      turnId={turnId}
      widgetId={widgetId}
      registerHandleResize={registerHandleResize}
      unregisterHandleResize={unregisterHandleResize}
      progress={progress}
      playing={playing}
      togglePlay={togglePlay}
      updateQuotesWidget={updateVideoQuotesWidget}
      widgetType={WIDGET_VIDEO_QUOTES}
      quoteType={TYPE_QUOTE_VIDEO}
      managePanelMode={MODE_WIDGET_VIDEO_QUOTES_MANAGE}
    />
  );
};

export default VideoQuotes;

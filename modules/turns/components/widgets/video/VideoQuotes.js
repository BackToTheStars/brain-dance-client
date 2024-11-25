import { WIDGET_VIDEO_QUOTES } from '@/modules/turns/settings';
import { updateVideoQuotesWidget } from '@/modules/turns/redux/actions';
import { MODE_WIDGET_VIDEO_QUOTES_MANAGE } from '@/config/panel';
import { TYPE_QUOTE_VIDEO } from '@/modules/quotes/settings';
import TimelineQuotes from '../timeline/Quotes';

const VideoQuotes = ({
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  progress = 0,
  playing,
  togglePlay,
}) => {
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

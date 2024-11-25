import { WIDGET_AUDIO_QUOTES } from '@/modules/turns/settings';
import { updateAudioQuotesWidget } from '@/modules/turns/redux/actions';
import { MODE_WIDGET_AUDIO_QUOTES_MANAGE } from '@/config/panel';
import { TYPE_QUOTE_AUDIO } from '@/modules/quotes/settings';
import TimelineQuotes from '../timeline/Quotes';

const AudioQuotes = ({
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
      updateQuotesWidget={updateAudioQuotesWidget}
      widgetType={WIDGET_AUDIO_QUOTES}
      quoteType={TYPE_QUOTE_AUDIO}
      managePanelMode={MODE_WIDGET_AUDIO_QUOTES_MANAGE}
    />
  );
};

export default AudioQuotes;

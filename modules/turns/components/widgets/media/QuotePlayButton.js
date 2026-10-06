import { Tooltip } from 'antd';
import { FiPause, FiPlay } from 'react-icons/fi';
import { LoadingOutlined } from '@ant-design/icons';
import { toggleQuotePlayback, useQuotePlayback } from './quotePlayback';

const TITLES = {
  idle: 'Play the quote',
  playing: 'Pause',
  loading: 'Starting the player…',
};

// tooltipPlacement — подсказка antd сбоку вместо системной (в панели: системная закрывала строку выше).
const QuotePlayButton = ({
  turnId,
  playerId,
  quote,
  className,
  testId,
  disabled,
  tooltipPlacement,
}) => {
  const state = useQuotePlayback(turnId, playerId, quote.id);
  const button = (
    <button
      type="button"
      className={className}
      data-test-id={testId}
      data-quote-id={quote.id}
      data-playing={state === 'playing' ? 'true' : 'false'}
      data-loading={state === 'loading' ? 'true' : 'false'}
      disabled={disabled}
      title={tooltipPlacement ? undefined : TITLES[state]}
      onClick={() =>
        toggleQuotePlayback({
          turnId,
          playerId,
          quoteId: quote.id,
          start: quote.start,
          end: quote.end,
        })
      }
    >
      {state === 'playing' && <FiPause />}
      {state === 'loading' && <LoadingOutlined />}
      {state === 'idle' && <FiPlay />}
    </button>
  );
  if (!tooltipPlacement) return button;
  return (
    <Tooltip title={TITLES[state]} placement={tooltipPlacement}>
      {button}
    </Tooltip>
  );
};

export default QuotePlayButton;

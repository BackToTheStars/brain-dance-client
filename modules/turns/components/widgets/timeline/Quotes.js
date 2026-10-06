import { memo, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { FiEdit } from 'react-icons/fi';
import { LoadingOutlined } from '@ant-design/icons';
import { MODE_GAME, PANEL_ADD_EDIT_TURN } from '@/config/panel';
import { TIMELINE_ROW_HEIGHT, quoteRectangleThickness } from '@/config/ui';
import { RULE_TURNS_CRUD } from '@/config/user';
import { TID } from '@/config/testIds';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { openMediaQuotesPanel } from '@/modules/panels/redux/mediaQuotesPanel';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { relativeRect } from '@/modules/game/components/helpers/zoom';
import { TYPE_QUOTE_AUDIO, TYPE_QUOTE_VIDEO } from '@/modules/quotes/settings';
import { WIDGET_AUDIO_QUOTES, WIDGET_VIDEO_QUOTES } from '@/modules/turns/settings';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { quotesFromSegments } from '../../helpers/timeline/quotes';
import QuotePlayButton from '../media/QuotePlayButton';
import { useQuoteLoading } from '../media/quotePlayback';
import { clearHoveredQuote, setHoveredQuote } from '../media/quoteMarks';

const KINDS = {
  audio: { widgetType: WIDGET_AUDIO_QUOTES, quoteType: TYPE_QUOTE_AUDIO, playerId: 'a_1' },
  video: { widgetType: WIDGET_VIDEO_QUOTES, quoteType: TYPE_QUOTE_VIDEO, playerId: 'v_1' },
};

const Marker = () => (
  <svg viewBox="0 0 10 9" width="10" height="9" aria-hidden="true">
    <path d="M5 0 10 9H0Z" fill="currentColor" />
  </svg>
);

const TimelineQuotes = ({
  kind,
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  widgetsUpdatedTime,
}) => {
  const { widgetType, quoteType, playerId } = KINDS[kind];
  const dispatch = useDispatch();
  const store = useStore();
  const { can } = useUserContext();
  const following = useSelector(selectFollowing);
  const formOpen = useSelector((s) => !!s.panels.d[PANEL_ADD_EDIT_TURN]?.isDisplayed);
  const canEdit = can(RULE_TURNS_CRUD) && !following && !formOpen;
  const segments = useSelector((s) => s.turns.d[turnId].dWidgets[widgetId].quotes);
  const duration = useSelector((s) => s.turns.d[turnId].dWidgets[widgetId].duration);
  const activeQuoteKey = useSelector((s) => s.quotes.activeQuoteKey);
  const turnLines = useSelector((s) => s.lines.dByTurnIdAndMarker[turnId]);
  const records = useSelector((s) => s.lines.quotesInfo[turnId]?.[widgetId]);
  const loading = useQuoteLoading(turnId, playerId);
  const boxRef = useRef(null);

  const quotes = useMemo(
    () => quotesFromSegments(segments, duration),
    [segments, duration],
  );
  const quotesRef = useRef(quotes);
  quotesRef.current = quotes;
  const quotesKey = useMemo(() => JSON.stringify(quotes), [quotes]);
  const height = quotes.length * TIMELINE_ROW_HEIGHT;

  useEffect(() => {
    registerHandleResize({
      type: widgetType,
      id: widgetId,
      minWidthCallback: () => 20,
      minHeightCallback: () => height,
      maxHeightCallback: () => height,
    });
    return () => unregisterHandleResize({ id: widgetId });
  }, [height]);

  useEffect(() => () => clearHoveredQuote(turnId), [turnId]);

  // Запись для линий — прямоугольник строки по вёрстке. Строку сдвигают и свой размер, и виджеты выше.
  useEffect(() => {
    const box = boxRef.current;
    const turnEl = box?.closest('.stb-react-turn');
    if (!box || !turnEl) return;
    let frame = null;
    const measure = () => {
      frame = null;
      const zoom = store.getState().game.zoom;
      const rows = box.querySelectorAll('.timeline-quote');
      const measured = [];
      for (const row of rows) {
        const quote = quotesRef.current.find(
          (q) => String(q.id) === row.dataset.quoteId,
        );
        if (!quote) continue;
        const rect = relativeRect(row, turnEl, zoom);
        if (!rect.width || !rect.height) return;
        measured.push({
          type: quoteType,
          quoteId: quote.id,
          quoteKey: `${turnId}_${quote.id}`,
          turnId,
          text: quote.text,
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
      dispatch(quoteCoordsUpdate(turnId, widgetId, measured));
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(box);
    for (let el = box.previousElementSibling; el; el = el.previousElementSibling) {
      observer.observe(el);
    }
    schedule();
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [quotesKey, widgetsUpdatedTime]);

  const frames = useMemo(() => {
    const ids = new Set(quotes.map((quote) => String(quote.id)));
    return (records || []).filter((record) => ids.has(String(record.quoteId)));
  }, [records, quotes]);

  const isLinked = (quoteId) => !!turnLines?.[quoteId]?.length;

  const activate = (quote) =>
    dispatch(
      processQuoteClicked(`${turnId}_${quote.id}`, can, () =>
        dispatch(setPanelMode({ mode: MODE_GAME })),
      ),
    );

  return (
    <div
      ref={boxRef}
      className="timeline-quotes turn-widget not-draggable cursor-auto"
      style={{ height: `${height}px` }}
    >
      <div className="timeline-quotes__rows">
        {quotes.map((quote, i) => {
          const active = activeQuoteKey === `${turnId}_${quote.id}`;
          return (
            <div
              key={quote.id}
              className="timeline-quote"
              data-test-id={TID.timeline.quote}
              data-turn-id={turnId}
              data-quote-id={quote.id}
              data-active={active ? 'true' : 'false'}
              data-linked={isLinked(quote.id) ? 'true' : 'false'}
              onMouseEnter={() => setHoveredQuote(turnId, quote.id)}
              onMouseLeave={() => clearHoveredQuote(turnId)}
            >
              <button
                type="button"
                className="timeline-quote__activate"
                data-test-id={TID.timeline.activate}
                aria-pressed={active}
                title="Select quote"
                onClick={() => activate(quote)}
              >
                <Marker />
              </button>
              <span
                className={
                  'timeline-quote__text' + (quote.text ? '' : ' timeline-quote__text_empty')
                }
                data-test-id={TID.timeline.quoteText}
                title={quote.text}
              >
                {quote.text || `Quote ${i + 1}`}
              </span>
              <QuotePlayButton
                turnId={turnId}
                playerId={playerId}
                quote={quote}
                className="icon-button timeline-quote__play"
                testId={TID.timeline.play}
              />
              {canEdit && (
                <button
                  type="button"
                  className="icon-button timeline-quote__edit"
                  data-test-id={TID.timeline.edit}
                  title="Edit quotes"
                  onClick={() =>
                    dispatch(openMediaQuotesPanel({ turnId, kind, quoteId: quote.id }))
                  }
                >
                  <FiEdit />
                </button>
              )}
              <span
                className="timeline-quote__duration"
                data-test-id={TID.timeline.duration}
              >
                {getFormattedDuration(quote.end - quote.start)}
              </span>
            </div>
          );
        })}
        {loading && (
          <div className="timeline-quotes__loading" data-test-id={TID.timeline.loading}>
            <LoadingOutlined />
          </div>
        )}
      </div>
      {frames.map((record) => {
        const framed =
          activeQuoteKey === record.quoteKey || isLinked(record.quoteId);
        return (
          <div
            key={record.quoteId}
            className="quote-rectangle quote-rectangle_timeline"
            data-test-id={TID.timeline.frame}
            data-turn-id={turnId}
            data-quote-key={record.quoteKey}
            data-framed={framed ? 'true' : 'false'}
            style={{
              left: record.left,
              top: record.top,
              width: record.width,
              height: record.height,
              outline: framed ? `${quoteRectangleThickness}px solid red` : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export default memo(TimelineQuotes);

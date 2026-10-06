import { useMemo, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';
import { TID } from '@/config/testIds';
import { quotesFromSegments } from '../../helpers/timeline/quotes';

const COLOR = 'var(--fragment-editable-color)';
const ACTIVE_COLOR = 'red';
const NONE = {};

const percent = (value, total) =>
  `${(Math.min(Math.max(value / total, 0), 1) * 100).toFixed(3)}%`;

// Строка ленты под мышью подсвечивает свою цитату на полоске плеера. Не Redux: это наведение,
// и перерисовываются только плееры того хода, чья строка наведена.
let hovered = null;
const hoverListeners = new Set();

export const setHoveredQuote = (turnId, quoteId) => {
  const next = turnId ? { turnId, quoteId: String(quoteId) } : null;
  if (hovered?.turnId === next?.turnId && hovered?.quoteId === next?.quoteId) return;
  hovered = next;
  hoverListeners.forEach((listener) => listener());
};

export const clearHoveredQuote = (turnId) => {
  if (hovered?.turnId === turnId) setHoveredQuote(null);
};

const subscribeHover = (listener) => {
  hoverListeners.add(listener);
  return () => hoverListeners.delete(listener);
};

const useHoveredQuoteId = (turnId) =>
  useSyncExternalStore(
    subscribeHover,
    () => (hovered?.turnId === turnId ? hovered.quoteId : null),
    () => null,
  );

// Цитаты ленты на полоске плеера: отрезки — фоном рельса, начала — метками antd Slider
// (клик по метке — перемотка к началу цитаты, как клик по полоске).
export const useQuoteMarks = (turnId, quotesWidgetId, duration) => {
  const segments = useSelector(
    (s) => s.turns.d[turnId]?.dWidgets?.[quotesWidgetId]?.quotes,
  );
  const savedDuration = useSelector(
    (s) => s.turns.d[turnId]?.dWidgets?.[quotesWidgetId]?.duration,
  );
  const activeQuoteKey = useSelector((s) => s.quotes.activeQuoteKey);
  const hoveredId = useHoveredQuoteId(turnId);

  return useMemo(() => {
    if (!segments?.length || !(duration > 0)) return NONE;
    const quotes = quotesFromSegments(segments, savedDuration || duration).filter(
      (quote) => quote.start < duration,
    );
    if (!quotes.length) return NONE;
    const marks = {};
    const stops = [];
    for (const quote of quotes) {
      const active = activeQuoteKey === `${turnId}_${quote.id}`;
      const hover = hoveredId === String(quote.id);
      const color = active || hover ? ACTIVE_COLOR : COLOR;
      const from = percent(quote.start, duration);
      const to = percent(quote.end, duration);
      stops.push(`transparent ${from}`, `${color} ${from} ${to}`, `transparent ${to}`);
      marks[quote.start] = {
        style: { color },
        label: (
          <span
            className="quote-mark"
            data-test-id={TID.media.quoteMark}
            data-quote-id={quote.id}
            data-active={active ? 'true' : 'false'}
            data-hovered={hover ? 'true' : 'false'}
          >
            <svg viewBox="0 0 10 9" width="8" height="7" aria-hidden="true">
              <path d="M5 0 10 9H0Z" fill="currentColor" />
            </svg>
          </span>
        ),
      };
    }
    return {
      marks,
      styles: {
        rail: { backgroundImage: `linear-gradient(to right, ${stops.join(', ')})` },
      },
    };
  }, [segments, savedDuration, duration, activeQuoteKey, hoveredId, turnId]);
};

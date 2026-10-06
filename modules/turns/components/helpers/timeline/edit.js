// Правка черновика ленты в панели: цитаты { id, start, end, text } по порядку начала, без пересечений.
// Граница упирается в соседа, цитата не короче MIN_QUOTE_SECONDS; id существующей цитаты не меняется.
import { MIN_QUOTE_SECONDS } from './quotes';

const byStart = (a, b) => a.start - b.start;

// «м:сс», «ч:мм:сс» или целые секунды; иначе null.
export const parseTime = (input) => {
  const text = String(input ?? '').trim();
  if (/^\d+$/.test(text)) return Number(text);
  let match = text.match(/^(\d+):([0-5]\d)$/);
  if (match) return Number(match[1]) * 60 + Number(match[2]);
  match = text.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
  if (match) {
    return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  }
  return null;
};

const neighbours = (quotes, index, total) => ({
  min: index > 0 ? quotes[index - 1].end : 0,
  max: index < quotes.length - 1 ? quotes[index + 1].start : total,
});

const replaceAt = (quotes, index, patch) =>
  quotes.map((quote, i) => (i === index ? { ...quote, ...patch } : quote));

const indexOfId = (quotes, id) =>
  quotes.findIndex((quote) => String(quote.id) === String(id));

// Начало — вниз до целой секунды (время с плеера чуть отстаёт от услышанного), конец остаётся.
export const setQuoteStart = (quotes, id, start, total) => {
  const index = indexOfId(quotes, id);
  if (index < 0) return { quotes, value: null, clamped: false };
  const quote = quotes[index];
  const wanted = Math.floor(start);
  const { min } = neighbours(quotes, index, total);
  const upper = Math.floor(quote.end - MIN_QUOTE_SECONDS);
  const value = Math.max(Math.min(wanted, upper), Math.ceil(min));
  return {
    quotes: replaceAt(quotes, index, { start: value }),
    value,
    clamped: value !== wanted,
  };
};

// Конец — вверх до целой секунды; у последней цитаты может быть равен дробной длительности файла.
export const setQuoteEnd = (quotes, id, end, total) => {
  const index = indexOfId(quotes, id);
  if (index < 0) return { quotes, value: null, clamped: false };
  const quote = quotes[index];
  const wanted = Math.ceil(end);
  const { max } = neighbours(quotes, index, total);
  const lower = quote.start + MIN_QUOTE_SECONDS;
  let value = wanted >= max ? max : wanted;
  if (value < lower) value = Math.min(lower, max);
  return {
    quotes: replaceAt(quotes, index, { end: value }),
    value,
    clamped: Math.ceil(value) !== wanted,
  };
};

export const setQuoteDuration = (quotes, id, length, total) => {
  const quote = quotes[indexOfId(quotes, id)];
  if (!quote) return { quotes, value: null, clamped: false };
  return setQuoteEnd(quotes, id, quote.start + length, total);
};

// Двойной ползунок: двигается та ручка, чьё значение изменилось.
export const setQuoteRange = (quotes, id, [start, end], total) => {
  const quote = quotes[indexOfId(quotes, id)];
  if (!quote) return { quotes, clamped: false };
  let next = { quotes, clamped: false };
  if (start !== quote.start) next = setQuoteStart(next.quotes, id, start, total);
  if (end !== quote.end) {
    const moved = setQuoteEnd(next.quotes, id, end, total);
    next = { quotes: moved.quotes, clamped: next.clamped || moved.clamped };
  }
  return next;
};

// Почему с текущего места нельзя начать цитату: null — можно.
export const addQuoteReason = (quotes, current, total) => {
  if (!(total > 0)) return 'no-duration';
  const start = Math.floor(current);
  if (quotes.some((quote) => quote.start <= start && start < quote.end)) {
    return 'inside-quote';
  }
  const next = [...quotes].sort(byStart).find((quote) => quote.start > start);
  const end = next ? next.start : total;
  if (end - start < MIN_QUOTE_SECONDS) return 'no-room';
  return null;
};

// Новая цитата с текущего места до начала следующей или до конца файла.
export const addQuoteAt = (quotes, current, total, id) => {
  const reason = addQuoteReason(quotes, current, total);
  if (reason) return { quotes, quote: null, reason };
  const start = Math.floor(current);
  const next = [...quotes].sort(byStart).find((quote) => quote.start > start);
  const quote = { id, start, end: next ? next.start : total, text: '' };
  return { quotes: [...quotes, quote].sort(byStart), quote, reason: null };
};

export const removeQuote = (quotes, id) =>
  quotes.filter((quote) => String(quote.id) !== String(id));

const same = (a, b) =>
  String(a.id) === String(b.id) &&
  a.start === b.start &&
  a.end === b.end &&
  (a.text || '') === (b.text || '');

export const sameQuotes = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  const left = [...a].sort(byStart);
  const right = [...b].sort(byStart);
  return left.every((quote, i) => same(quote, right[i]));
};

// Конец «до конца файла» следует за длительностью, известной при записи; текст без краевых пробелов.
export const quotesForSave = (quotes, total, savedDuration) =>
  [...quotes].sort(byStart).map((quote) => ({
    id: quote.id,
    start: quote.start,
    end:
      quote.end > total || (savedDuration > 0 && quote.end === savedDuration)
        ? total
        : quote.end,
    text: (quote.text || '').trim(),
  }));

// Снятые цитаты, на которых держатся линии, и сами линии без повторов — для окна перед записью.
export const lostLinks = (prevQuotes = [], nextQuotes = [], turnLines = {}) => {
  const kept = new Set(nextQuotes.map((quote) => String(quote.id)));
  const quoteIds = [];
  const lineIds = new Set();
  for (const quote of prevQuotes) {
    if (kept.has(String(quote.id))) continue;
    const lines = turnLines?.[quote.id] || [];
    if (!lines.length) continue;
    quoteIds.push(quote.id);
    lines.forEach((line) => lineIds.add(line._id));
  }
  return {
    quoteIds,
    lineIds: [...lineIds],
    quotesCount: quoteIds.length,
    linesCount: lineIds.size,
  };
};

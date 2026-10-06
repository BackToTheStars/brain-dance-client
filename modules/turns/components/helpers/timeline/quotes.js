// На сервере лента — отрезки { id, start, text, active } подряд по файлу, конец — начало следующего
// или длительность; цитата — отрезок с active. Время — целые секунды, кроме конца, равного длительности.

export const MIN_QUOTE_SECONDS = 1;

const byStart = (a, b) => a.start - b.start;

export const quotesFromSegments = (segments = [], duration = 0) => {
  const sorted = [...segments].sort(byStart);
  const quotes = [];
  sorted.forEach((segment, i) => {
    if (!segment.active) return;
    const next = sorted[i + 1];
    quotes.push({
      id: segment.id,
      start: segment.start,
      end: next ? next.start : duration,
      text: segment.text || '',
    });
  });
  return quotes;
};

// Свежие id — от секунд `now`, мимо занятых: у цитат и маркеров линий хода одно пространство id.
export const createIdAllocator = (takenIds = [], now = 0) => {
  const taken = new Set([...takenIds].map(String));
  let next = Math.floor(now / 1000);
  return () => {
    while (taken.has(String(next))) next += 1;
    taken.add(String(next));
    return next;
  };
};

export const newQuoteId = (takenIds, now) => createIdAllocator(takenIds, now)();

// Промежуток с тем же началом, что в прежней ленте, сохраняет свой id.
export const segmentsFromQuotes = (
  quotes = [],
  duration = 0,
  { prevSegments = [], takenIds = [], now = 0 } = {},
) => {
  const sorted = [...quotes].sort(byStart);
  if (!sorted.length) return [];
  const gapIds = new Map(
    prevSegments.filter((s) => !s.active).map((s) => [s.start, s.id]),
  );
  const allocate = createIdAllocator(
    [...takenIds, ...sorted.map((q) => q.id), ...prevSegments.map((s) => s.id)],
    now,
  );
  const gap = (start) => ({
    id: gapIds.has(start) ? gapIds.get(start) : allocate(),
    start,
    text: '',
    active: false,
  });
  const segments = [];
  let cursor = 0;
  for (const quote of sorted) {
    if (quote.start > cursor) segments.push(gap(cursor));
    segments.push({ id: quote.id, start: quote.start, text: quote.text || '', active: true });
    cursor = quote.end;
  }
  if (cursor < duration) segments.push(gap(cursor));
  return segments;
};

// Пустой список — можно сохранять; иначе [{ id, code }] по каждой нарушенной проверке.
export const checkQuotes = (quotes = [], duration = 0) => {
  const problems = [];
  const seen = new Set();
  const sorted = [...quotes].sort(byStart);
  sorted.forEach((quote, i) => {
    const add = (code) => problems.push({ id: quote.id, code });
    if (seen.has(String(quote.id))) add('duplicate-id');
    seen.add(String(quote.id));
    if (
      !Number.isInteger(quote.start) ||
      !(Number.isInteger(quote.end) || quote.end === duration)
    ) {
      add('not-whole-seconds');
    }
    if (quote.start < 0 || quote.end > duration) add('out-of-range');
    if (!(quote.end - quote.start >= MIN_QUOTE_SECONDS)) add('too-short');
    if (i > 0 && quote.start < sorted[i - 1].end) add('overlap');
  });
  return problems;
};

export const turnQuoteIds = (turn, lineMarkers = []) => [
  ...(turn?.quotes || []).map((quote) => quote.id),
  ...(turn?.dWidgets?.aq_1?.quotes || []).map((segment) => segment.id),
  ...(turn?.dWidgets?.vq_1?.quotes || []).map((segment) => segment.id),
  ...lineMarkers,
];

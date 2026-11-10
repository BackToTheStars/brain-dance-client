import { TURN_BORDER_THICKNESS } from '@/config/ui';

export const filterLinesByQuoteKeys = (lines, quoteKeys) => {
  const d = {};
  for (let key of quoteKeys) {
    d[key] = true;
  }
  return lines.filter(
    (line) =>
      d[`${line.sourceTurnId}_${line.sourceMarker}`] ||
      d[`${line.targetTurnId}_${line.targetMarker}`]
  );
};

export const filterLinesByQuoteKey = (lines, quoteKey) =>
  lines.filter(
    (line) =>
      `${line.sourceTurnId}_${line.sourceMarker}` === quoteKey ||
      `${line.targetTurnId}_${line.targetMarker}` === quoteKey
  );

export const findLineByQuoteKey = (lines, quoteKey) =>
  lines.find(
    (line) =>
      `${line.sourceTurnId}_${line.sourceMarker}` === quoteKey ||
      `${line.targetTurnId}_${line.targetMarker}` === quoteKey
  );

export const filterLinesByTurnId = (lines, turnId) =>
  lines.filter(
    (line) => line.sourceTurnId === turnId || line.targetTurnId === turnId
  );

// Ключи концов линий собираются один раз: цитат у хода бывает тысяча, линий — десятки.
export const getActiveQuotesDictionary = (quotes, lines) => {
  const linked = new Set();
  for (const line of lines) {
    linked.add(`${line.sourceTurnId}_${line.sourceMarker}`);
    linked.add(`${line.targetTurnId}_${line.targetMarker}`);
  }
  const d = {};
  for (const quote of quotes) {
    if (linked.has(`${quote.turnId}_${quote.quoteId}`)) d[quote.quoteId] = true;
  }
  return d;
};

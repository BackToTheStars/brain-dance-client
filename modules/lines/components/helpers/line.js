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

export const getActiveQuotesDictionary = (quotes, lines) => {
  const d = {};
  for (let quote of quotes) {
    d[quote._id] = false;
    if (findLineByQuoteKey(lines, `${quote.turnId}_${quote.quoteId}`)) {
      d[quote.quoteId] = true;
    }
  }
  return d;
};

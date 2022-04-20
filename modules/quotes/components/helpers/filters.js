export const filterQuotesDeleted = (prevTurnQuotes, newTurnQuotes) => {
  //
  const d = {};
  const quotesDeleted = [];

  for (let quote of newTurnQuotes) {
    d[quote.id] = true;
  }

  for (let quote of prevTurnQuotes) {
    if (!d[quote.id]) quotesDeleted.push(quote);
  }

  return quotesDeleted;
};

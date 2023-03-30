class TextAroundQuotesClass {
  constructor({
    originalQuotes,
    turnId,
    index, // index это порядковый номер куска параграфа
    widgetCoords,
    originalMiniParagraphTop,
    realMiniParagraphTop,
  }) {
    this.originalQuotes = originalQuotes; // свойства/properties/поля класса, станут свойствами объекта
    this.widgetCoords = widgetCoords;
    this.originalMiniParagraphTop = originalMiniParagraphTop;
    this.realMiniParagraphTop = realMiniParagraphTop;
    this.quotes = this.originalQuotes.map((quote) => {
      return {
        top: quote.top - originalMiniParagraphTop + realMiniParagraphTop,
        initialCoords: quote,
      };
    });
  }

  getOriginalQuoteInfo(quoteIndex) {
    // метод класса
    return this.originalQuotes[quoteIndex];
  }
}
// t.getOriginalQuoteInfo(0);

const store = {};

if (typeof window !== 'undefined') {
  window.compressedParagraphStore = store;
}

export const createTextAroundQuotesObject = (params) => {
  const key = `${params.turnId}_${params.index}`;
  store[key] = new TextAroundQuotesClass(params);
};

// const t = new TextAroundQuotesClass(params);

// t.getQuoteInfo(0);

// t.widgetCoordsInTurn;
// t.originalMiniParagraphTop;
// t.realMiniParagraphTop;
// t.scrollTop;

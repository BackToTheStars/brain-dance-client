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

const store = {};

if (typeof window !== 'undefined') {
  window.compressedParagraphStore = store;
}

export const createTextAroundQuotesObject = (params) => {
  const key = `${params.turnId}_${params.index}`;
  store[key] = new TextAroundQuotesClass(params);
};
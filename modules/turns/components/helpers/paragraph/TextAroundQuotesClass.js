class TextAroundQuotesClass {
  constructor({
    originalQuotes,
    turnId,
    index, // index это порядковый номер куска параграфа
  }) {
    this.originalQuotes = originalQuotes; // свойства/properties/поля класса, станут свойствами объекта
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

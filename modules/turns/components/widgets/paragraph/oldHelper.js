// import { freeSpaceRequired } from '../../const';
export const freeSpaceRequired = 100
export const calculateTextPiecesFromQuotes = (
  quotesWithCoords,
  paragraphElCurrent
) => {
  //
  const textQuotesVerticalPositions = quotesWithCoords.map((quote) => ({
    top: quote.initialCoords.top + paragraphElCurrent.scrollTop, // - 40, // @todo: использовать положение параграфа
    height: quote.initialCoords.height,
    left: quote.initialCoords.left,
    width: quote.initialCoords.width,
    quoteId: quote.quoteId,
    quoteKey: quote.quoteKey,
    text: quote.text,
  }));

  const createEmptyTextPiece = () => ({
    quotes: [],
    height: 0,
    top: 0,
    scrollHeight: 0,
  });

  const textPieces = [];
  let textPiece = createEmptyTextPiece();
  let prevTextPiece = null;

  // @todo отдельно просчитать случай с одной цитатой

  for (let i = 0; i < textQuotesVerticalPositions.length; i++) {
    const quote = textQuotesVerticalPositions[i];

    if (i === 0) {
      // первый textPiece
      textPiece.height = Math.min(quote.top, freeSpaceRequired) + quote.height; // остановка внизу цитаты
      textPiece.quotes.push(quote); // { top: ..., height: ...}
      textPiece.scrollHeight = quote.top + quote.height;
      // textPieces.push(textPiece); // @todo: убрать
      continue;
    } else if (!textPiece.quotes.length) {
      // } else {
      // @todo: check
      // textPiece.height = freeSpaceRequired + quote.height;
    }
    // @todo: iterations count

    if (
      quote.top - (textPiece.top + textPiece.scrollHeight) > // если есть отсечка
      2 * freeSpaceRequired
    ) {
      const middle = Math.floor(
        (quote.top - (textPiece.top + textPiece.scrollHeight)) / 2
      );
      textPiece.scrollHeight = textPiece.scrollHeight + middle;
      textPieces.push(textPiece);
      textPiece.height += freeSpaceRequired; // quote.height;
      prevTextPiece = textPiece;
      textPiece = createEmptyTextPiece();
      textPiece.top = prevTextPiece.top + prevTextPiece.scrollHeight;
      textPiece.quotes.push(quote);
      textPiece.height = freeSpaceRequired + quote.height;
      textPiece.scrollHeight = quote.top + quote.height - textPiece.top;

      // textPiece.height += quote.height;
    } else {
      // если нет отсечки, и мы до сих пор накапливаем цитаты, то
      textPiece.height +=
        quote.top - (textPiece.top + textPiece.scrollHeight) + quote.height;
      textPiece.quotes.push(quote);
      textPiece.scrollHeight = quote.top + quote.height - textPiece.top;
    }

    if (i === textQuotesVerticalPositions.length - 1) {
      // если это последний фрагмент, то
      const realScrollHeight = paragraphElCurrent.scrollHeight - textPiece.top;
      // console.log(paragraphElCurrent.scrollHeight, textPiece.top);
      // console.log({ realScrollHeight, scrollHeight2: textPiece.scrollHeight });
      textPiece.height += Math.min(
        realScrollHeight - textPiece.scrollHeight,
        freeSpaceRequired
      );
      textPiece.scrollHeight = realScrollHeight;
      textPieces.push(textPiece);
    }
  }

  for (let i = 0; i < textPieces.length; i++) {
    const textPiece = textPieces[i];
    const top = textPiece.quotes[0].top;
    if (i === 0) {
      textPiece.viewportTop =
        top < freeSpaceRequired ? 0 : top - freeSpaceRequired;
      textPiece.scrollTop = textPiece.viewportTop - textPiece.top;
      continue;
    }
    textPiece.viewportTop = top - freeSpaceRequired;
    textPiece.scrollTop = textPiece.viewportTop - textPiece.top;
  }
  return textPieces;
};

export const consoleLogLines = (textPieces, updateDebugLines) => {
  const left = 700; // начало текстового блока
  const top = 20;
  const drawTopLines = textPieces.map((textPiece) => ({
    x1: left,
    x2: left + 300,
    y1: textPiece.top + top,
    y2: textPiece.top + top,
    color: 'green',
  }));

  const drawViewportTopLines = textPieces.map((textPiece) => ({
    // топ вьюпорта
    x1: left,
    x2: left + 300,
    y1: textPiece.viewportTop + top,
    y2: textPiece.viewportTop + top,
    color: 'red',
  }));

  const drawViewportBottomLines = textPieces.map((textPiece) => ({
    x1: left,
    x2: left + 200,
    y1: textPiece.viewportTop + textPiece.height + top,
    y2: textPiece.viewportTop + textPiece.height + top,
    color: 'blue',
  }));

  const drawBottomLines = textPieces.map((textPiece) => ({
    x1: left,
    x2: left + 200,
    y1: textPiece.top + textPiece.scrollHeight + top,
    y2: textPiece.top + textPiece.scrollHeight + top,
    color: 'purple',
  }));

  updateDebugLines([
    ...drawTopLines,
    ...drawViewportTopLines,
    ...drawViewportBottomLines,
    ...drawBottomLines,
  ]);
};

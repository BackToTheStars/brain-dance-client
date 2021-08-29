import { useEffect, useRef } from 'react';

let incId = Math.floor(new Date().getTime() / 1000);

export const ParagraphTextWrapper = ({
  arrText,
  setQuotes,
  onQuoteClick,
  updateSizeTime,
  // paragraphHeight,
  // paragraphWidth,
  // paragraphScroll,
  paragraphRect,
  turnId,
}) => {
  return (
    <>
      {arrText.map((textItem, i) => {
        // @todo: refactoring
        const arrInserts = textItem.insert ? textItem.insert.split('\n') : [];
        const newInserts = [];
        for (let j = 0; j < arrInserts.length; j++) {
          newInserts.push(arrInserts[j]);
          newInserts.push(<br key={j} />);
        }
        newInserts.pop();
        return (
          <SpanTextPiece
            key={i}
            {...{
              textItem,
              newInserts,
              setQuotes,
              onQuoteClick,
              updateSizeTime,
              // paragraphHeight,
              // paragraphWidth,
              // paragraphScroll,
              paragraphRect,
              turnId,
            }}
          />
        );
      })}
    </>
  );
};

export const SpanTextPiece = ({
  textItem,
  newInserts,
  setQuotes,
  onQuoteClick,
  updateSizeTime,
  // paragraphHeight,
  // paragraphWidth,
  // paragraphScroll,
  paragraphRect,
  turnId,
}) => {
  const spanFragment = useRef(null);
  const isItQuote = textItem.attributes
    ? !!textItem.attributes.background
    : false;

  useEffect(() => {
    if (!isItQuote) {
      return;
    }

    setQuotes((quotes) => {
      const rect = spanFragment.current.getBoundingClientRect();
      if (turnId === '6100ca06b1871a48ccce1849') {
        console.log({ rect });
      }
      // @todo: refactoring
      const turnEl = spanFragment.current.parentElement.parentElement;
      let isQuoteVisible = true;

      if (paragraphRect) {
        // console.log(
        // paragraphRect.top - rect.top
        // { rect, paragraphRect }
        // paragraphTop - rect.top,
        // rect.height / 2,
        // paragraphScroll,
        // paragraphHeight,
        // paragraphTop + paragraphScroll,
        // rect.top
        // );
      }

      let left = rect.left - turnEl.offsetLeft;
      let top = rect.top - turnEl.offsetTop;
      let width = rect.width;
      let height = rect.height;
      let position = 'default';
      const outlineWidth = 2; // ещё в Turn.js строчка 466

      if (rect.top + rect.height / 2 < paragraphRect.top) {
        // console.log('quote hidden up');
        //
        height = 0;
        width = paragraphRect.width - outlineWidth; // 2 ширины рамки
        left = paragraphRect.left - turnEl.offsetLeft + outlineWidth;
        top = paragraphRect.top - turnEl.offsetTop + outlineWidth;
        position = 'top';
        //
      } else if (
        rect.top + rect.height / 2 >
        paragraphRect.top + paragraphRect.height
      ) {
        height = 0;
        width = paragraphRect.width - outlineWidth;
        left = paragraphRect.left - turnEl.offsetLeft + outlineWidth;
        top =
          paragraphRect.top +
          paragraphRect.height -
          turnEl.offsetTop +
          outlineWidth;
        position = 'bottom';
      }

      if (turnId === '6100ca06b1871a48ccce1849') {
        console.log([
          ...quotes,
          {
            quoteId,
            quoteKey: `${turnId}_${quoteId}`,
            turnId,
            // id: 'quote-' + (textItem.attributes.id || (incId += 1)),
            width,
            height,
            left,
            top,
            text: textItem.insert.trim(),
            position,
          },
        ]);
      }

      const quoteId = textItem.attributes.id || new Date().getTime();
      return [
        ...quotes,
        {
          quoteId,
          quoteKey: `${turnId}_${quoteId}`,
          turnId,
          // id: 'quote-' + (textItem.attributes.id || (incId += 1)),
          width,
          height,
          left,
          top,
          text: textItem.insert.trim(),
          position,
        },
      ];
    });
    // console.log(spanFragment.current.getBoundingClientRect());
    // console.log({ newInserts });
  }, [updateSizeTime]);

  return (
    <span
      style={textItem.attributes}
      data-id={isItQuote ? textItem.attributes.id : ''}
      onClick={() => {
        if (isItQuote && textItem.attributes.id) {
          onQuoteClick(textItem.attributes.id);
          // alert(`Мой id: ${textItem.attributes.id}`);
        }
        // console.log(isItQuote);
      }}
      ref={spanFragment}
    >
      {newInserts}
    </span>
  );
};

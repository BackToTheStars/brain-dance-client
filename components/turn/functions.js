import { useEffect, useRef } from 'react';
// import { PANEL_LINES } from '../contexts/InteractionContext';

let incId = Math.floor(new Date().getTime() / 1000);

export const ParagraphTextWrapper = ({
  arrText,
  setQuotes,
  // onQuoteClick,
  updateSizeTime,
  // paragraphHeight,
  // paragraphWidth,
  // paragraphScroll,
  // paragraphRect,
  turnId,
  // activeQuote,
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
              // onQuoteClick,
              updateSizeTime,
              // paragraphHeight,
              // paragraphWidth,
              // paragraphScroll,
              // paragraphRect,
              turnId,
              // activeQuote,
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
  // onQuoteClick,
  updateSizeTime,
  // activeQuote,
  // paragraphHeight,
  // paragraphWidth,
  // paragraphScroll,
  // paragraphRect,
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
      // @todo: refactoring
      const turnElRect =
        spanFragment.current.parentElement.parentElement.getBoundingClientRect();
      const paragraphRect =
        spanFragment.current.parentElement.getBoundingClientRect();

      // turnEl.offsetLeft -> turnElRect.left
      // turnEl.offsetTop -> turnElRect.top

      // const paragraphEl = spanFragment.current.parentElement;
      // const paragraphElRect = paragraphEl.getBoundingClientRect();

      // if (turnElRect.left !== paragraphElRect.left) {
      //   console.log({ turnId }, turnElRect.left - paragraphElRect.left);
      // }

      // let isQuoteVisible = true;

      // if (paragraphRect) {
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
      // }

      let left = rect.left - turnElRect.left;
      let top = rect.top - turnElRect.top;
      let width = rect.width;
      let height = rect.height;
      let position = 'default';
      const outlineWidth = 2; // ещё в Turn.js строчка 466

      const initialCoords = { left, top, width, height };

      if (rect.top + rect.height / 2 < paragraphRect.top) {
        //
        height = 0;
        width = paragraphRect.width - outlineWidth; // 2 ширины рамки
        left = paragraphRect.left - turnElRect.left + outlineWidth;
        top = paragraphRect.top - turnElRect.top + outlineWidth;
        position = 'top';
        //
      } else if (
        rect.top + rect.height / 2 >
        paragraphRect.top + paragraphRect.height
      ) {
        height = 0;
        width = paragraphRect.width - outlineWidth;
        left = paragraphRect.left - turnElRect.left + outlineWidth;
        top =
          paragraphRect.top +
          paragraphRect.height -
          turnElRect.top +
          outlineWidth;
        position = 'bottom';
      }

      const quoteId = textItem.attributes.id || new Date().getTime();
      return [
        ...quotes,
        {
          initialCoords,
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
  }, [updateSizeTime]);

  return (
    <span
      style={textItem.attributes}
      data-id={isItQuote ? textItem.attributes.id : ''}
      onClick={() => {
        // @todo унифицировать чтобы не расходились методы управления панелью цитат
        // if (isItQuote && textItem.attributes.id) {
        //   const isQuoteActive =
        //     activeQuote &&
        //     activeQuote.turnId === turnId &&
        //     activeQuote.quoteId === textItem.attributes.id;
        //   onQuoteClick(textItem.attributes.id);
        //   if (isQuoteActive) {
        //     setInteractionMode(MODE_GAME);
        //     setPanelType(null);
        //   } else {
        //     // setInteractionMode(MODE_WIDGET_TEXT_QUOTE_ACTIVE); // @todo
        //     setPanelType(PANEL_LINES);
        //   }
        // }
      }}
      ref={spanFragment}
    >
      {newInserts}
    </span>
  );
};

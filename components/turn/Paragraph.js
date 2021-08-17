import { useRef, useEffect, useState } from 'react';
import { ParagraphTextWrapper } from './functions';
import {
  ACTION_QUOTE_COORDS_UPDATED,
  ACTION_QUOTE_CLICKED,
} from '../contexts/TurnContext';

const Paragraph = ({
  contentType,
  backgroundColor,
  fontColor,
  paragraph,
  updateSizeTime,
  registerHandleResize,
  variableHeight,
  quotes,
  dispatch,
  _id,
  lineEnds,
  activeQuote,
}) => {
  // topQuotesCount,
  const topQuotesCount = 0;
  // bottomQuotesCount,
  const bottomQuotesCount = 0;
  const onQuoteClick = (quoteId) => {
    dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId: _id, quoteId } });
  };

  const paragraphEl = useRef(null);

  const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);

  useEffect(() => {
    if (!paragraphEl.current) return;
    registerHandleResize({
      type: 'paragraph',
      id: 'paragraph',
      // этот виджет является гибким
      variableHeight: true,
      minWidthCallback: () => {
        return 300;
      },
      minHeightCallback: () => {
        return 40;
      },
      maxHeightCallback: () => {
        return paragraphEl.current.scrollHeight;
      },
    });
  }, [paragraphEl]);

  useEffect(() => {
    setQuotesLoaded(false);
    setQuotesWithCoords([]);
  }, [updateSizeTime]);

  useEffect(() => {
    console.log({ quotesWithCoords });
    if (quotesLoaded) return;
    if (quotesWithCoords.length === quotes.length) {
      setQuotesLoaded(true);
      dispatch({
        type: ACTION_QUOTE_COORDS_UPDATED,
        payload: { turnId: _id, quotesInfo: quotesWithCoords },
      });
    }
  }, [quotesWithCoords]);

  const style = {};

  if (contentType === 'comment') {
    style.backgroundColor = backgroundColor;
    style.color = fontColor || 'black';
  }
  if (!!variableHeight) {
    style.height = `${variableHeight}px`;
  }

  return (
    <>
      <p className="paragraphText" ref={paragraphEl} style={style}>
        {!!topQuotesCount && (
          <div className="top-quotes-counter">{topQuotesCount}</div>
        )}
        <ParagraphTextWrapper
          arrText={paragraph || []}
          updateSizeTime={updateSizeTime}
          setQuotes={setQuotesWithCoords}
          onQuoteClick={onQuoteClick}
          paragraphRect={
            !!paragraphEl && !!paragraphEl.current
              ? paragraphEl.current.getBoundingClientRect()
              : {}
          }
        />
        {!!bottomQuotesCount && (
          <div className="bottom-quotes-counter">{bottomQuotesCount}</div>
        )}
      </p>

      {quotesWithCoords.map((quote, i) => {
        let bordered = !!lineEnds[quote.id]; // проверка нужно показывать рамку или нет
        let outline = '0px solid transparent';
        if (
          activeQuote &&
          activeQuote.turnId === _id &&
          activeQuote.quoteId === quote.id
        ) {
          bordered = true;
        }
        if (bordered) {
          outline = '2px solid red';
          if (quote.position === 'top' || quote.position === 'bottom') {
            outline = '2px solid red';
          }
        }

        return (
          <div
            className="quote-rectangle"
            key={quote.id}
            style={{
              ...quote,
              outline,
            }}
            onClick={() => onQuoteClick(quote.id)}
          ></div>
        );
      })}
    </>
  );
};

export default Paragraph;

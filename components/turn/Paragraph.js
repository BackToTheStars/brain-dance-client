import { useRef, useEffect, useState } from 'react';
import { ParagraphTextWrapper } from './functions';
import {
  ACTION_QUOTE_COORDS_UPDATED,
  ACTION_QUOTE_CLICKED,
  ACTION_TURN_WAS_CHANGED,
} from '../contexts/TurnContext';

const delayRenderScroll = 5;
let timerScroll = null;

const Paragraph = ({
  contentType,
  backgroundColor,
  fontColor,
  paragraph,
  updateSizeTime,
  registerHandleResize,
  unregisterHandleResize,
  variableHeight,
  quotes,
  dispatch,
  _id,
  lineEnds,
  activeQuote,
  quotesWithCoords,
  setQuotesWithCoords,
  quotesLoaded,
  setQuotesLoaded,
  scrollPosition,
  recalculateQuotes,
}) => {
  const topQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.id] && quote.position === 'top';
  }).length;
  const bottomQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.id] && quote.position === 'bottom';
  }).length;

  const onQuoteClick = (quoteId) => {
    dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId: _id, quoteId } });
  };

  const paragraphEl = useRef(null);

  // const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  // const [quotesLoaded, setQuotesLoaded] = useState(false);

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
        if (!paragraphEl.current) {
          console.log(paragraph);
          return 0;
        }
        return paragraphEl.current.scrollHeight;
      },
    });
    return unregisterHandleResize({ id: 'paragraph' });
  }, [paragraphEl]);

  // useEffect(() => {
  //   setQuotesLoaded(false);
  //   setQuotesWithCoords([]);
  // }, [updateSizeTime]);

  useEffect(() => {
    if (quotesLoaded) return;
    if (quotesWithCoords.length === quotes.length) {
      setQuotesLoaded(true);
      dispatch({
        type: ACTION_QUOTE_COORDS_UPDATED,
        payload: { turnId: _id, quotesInfo: quotesWithCoords },
      });
    }
  }, [quotesWithCoords]);

  useEffect(() => {
    if (!paragraphEl || !paragraphEl.current) return;
    paragraphEl.current.scrollTop = scrollPosition;
    recalculateQuotes();
  }, [paragraphEl, scrollPosition]);

  useEffect(() => {
    if (!paragraphEl || !paragraphEl.current) return;
    paragraphEl.current.addEventListener('scroll', () => {
      // handleResize();
      if (timerScroll) {
        clearTimeout(timerScroll);
      }
      timerScroll = setTimeout(() => {
        dispatch({
          type: ACTION_TURN_WAS_CHANGED,
          payload: {
            _id: _id,
            wasChanged: true,
            scrollPosition: paragraphEl.current.scrollTop,
          },
        });
      }, delayRenderScroll);
    });
  }, [paragraphEl]);

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
          <span className="top-quotes-counter">{topQuotesCount}</span>
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
          <span className="bottom-quotes-counter">{bottomQuotesCount}</span>
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

import { useRef, useEffect, useState } from 'react';
import { ParagraphTextWrapper } from './functions';
import {
  ACTION_QUOTE_COORDS_UPDATED,
  ACTION_QUOTE_CLICKED,
  ACTION_TURN_WAS_CHANGED,
} from '../contexts/TurnContext';
import { quoteRectangleThickness } from '../сonst';
import {
  MODE_GAME,
  INTERACTION_COMPRESS_PARAGRAPH,
  PANEL_LINES,
  useInteractionContext,
} from '../contexts/InteractionContext';

// const delayRenderScroll = 20;

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
  turnId,
  makeWidgetActive,
  isActive,
}) => {
  const topQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'top';
  }).length;
  const bottomQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'bottom';
  }).length;

  const {
    setInteractionMode,
    interactionType,
    bottomPanelSettings: { setPanelType },
  } = useInteractionContext();

  const onQuoteClick = (quoteId) => {
    dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId: _id, quoteId } });
  };

  const paragraphEl = useRef(null);

  // const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  // const [quotesLoaded, setQuotesLoaded] = useState(false);

  useEffect(() => {
    if (isActive && interactionType === INTERACTION_COMPRESS_PARAGRAPH) {
      console.log(quotesWithCoords);
      console.log(paragraphEl.current.getBoundingClientRect());
      console.log(paragraphEl.current.scrollTop);
      console.log(paragraphEl.current.scrollHeight);
    }
  }, [isActive, interactionType]);

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
          return 0;
        }
        return paragraphEl.current.scrollHeight;
      },
    });
    return () => unregisterHandleResize({ id: 'paragraph' }); // return будет вызван только в момент unmount
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
    setTimeout(() => {
      if (!paragraphEl || !paragraphEl.current) return;
      if (
        Math.floor(paragraphEl.current.scrollTop) === Math.floor(scrollPosition)
      )
        return;
      // console.log(scrollPosition, 2);
      recalculateQuotes();
    }, 50);
  }, [paragraphEl, scrollPosition]);

  useEffect(() => {
    paragraphEl.current.scrollTop = scrollPosition;
  }, []);

  useEffect(() => {
    if (!paragraphEl || !paragraphEl.current) return;

    const scrollHandler = () => {
      if (!!paragraphEl.current) {
        // console.log(Math.floor(paragraphEl.current.scrollTop), 3);
        dispatch({
          type: ACTION_TURN_WAS_CHANGED,
          payload: {
            _id: _id,
            wasChanged: true,
            scrollPosition: Math.floor(paragraphEl.current.scrollTop),
          },
        });
      } else {
        // console.log(`!!paragraphEl.current turnId: ${turnId}`);
      }
    };

    paragraphEl.current.addEventListener('scroll', scrollHandler);
    // @todo: removeEventListener scroll
    return () => {
      if (!!paragraphEl.current)
        paragraphEl.current.removeEventListener('scroll', scrollHandler);
    };
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
          turnId={turnId}
          activeQuote={activeQuote}
          // paragraphRect={
          //   !!paragraphEl && !!paragraphEl.current
          //     ? paragraphEl.current.getBoundingClientRect()
          //     : {}
          // }
        />
        {!!bottomQuotesCount && (
          <span className="bottom-quotes-counter">{bottomQuotesCount}</span>
        )}
        <a
          className="widget-button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            makeWidgetActive();
            // console.log('paragraph active!');
          }}
        >
          <i className="fas fa-highlighter"></i>
        </a>
      </p>

      {quotesWithCoords.map((quote, i) => {
        // все цитаты
        let bordered = !!lineEnds[`${quote.turnId}_${quote.quoteId}`]; // проверка нужно показывать рамку или нет
        let outline = '0px solid transparent';
        if (
          activeQuote &&
          activeQuote.turnId === _id &&
          activeQuote.quoteId === quote.quoteId
        ) {
          bordered = true;
        }
        if (bordered) {
          outline = `${quoteRectangleThickness}px solid red`;
          if (quote.position === 'top' || quote.position === 'bottom') {
            outline = `${quoteRectangleThickness}px solid red`;
          }
        }

        return (
          <div
            className="quote-rectangle"
            key={quote.quoteKey}
            style={{
              ...quote,
              outline,
            }}
            onClick={() => {
              onQuoteClick(quote.quoteId);
              const isQuoteActive =
                activeQuote &&
                activeQuote.turnId === turnId &&
                activeQuote.quoteId === quote.quoteId;
              if (isQuoteActive) {
                setInteractionMode(MODE_GAME);
                setPanelType(null);
              } else {
                // setInteractionMode(MODE_WIDGET_TEXT_QUOTE_ACTIVE); // @todo
                if (
                  lineEnds[`${quote.turnId}_${quote.quoteId}`]
                  // && !!activeQuote
                ) {
                  setPanelType(PANEL_LINES);
                }
              }
            }}
          ></div>
        );
      })}
    </>
  );
};

export default Paragraph;

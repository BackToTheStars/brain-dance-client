import { useRef, useEffect, useState } from 'react';
import { ParagraphTextWrapper } from './functions';
import {
  ACTION_QUOTE_COORDS_UPDATED,
  ACTION_QUOTE_CLICKED,
  ACTION_TURN_WAS_CHANGED,
} from '../contexts/TurnsCollectionContext';
import { quoteRectangleThickness } from '../const';
import {
  MODE_GAME,
  INTERACTION_COMPRESS_PARAGRAPH,
  INTERACTION_UNCOMPRESS_PARAGRAPH,
  PANEL_LINES,
  useInteractionContext,
} from '../contexts/InteractionContext';
import { useUiContext } from '../contexts/UI_Context';
import { useTurnContext } from '../contexts/TurnContext';
import {
  calculateTextPiecesFromQuotes,
  consoleLogLines,
} from './paragraph/helper';
import ParagraphOriginal from './paragraph/ParagraphOriginal';

// const delayRenderScroll = 20;

const Paragraph = ({
  registerHandleResize,
  unregisterHandleResize,
  variableHeight,
  setTextPieces,
  // quotesWithCoords,
  // setQuotesWithCoords,
  makeWidgetActive,
  isActive,
  compressedHeight,
  setCompressedHeight,
  turnSavePreviousHeight,
  turnReturnPreviousHeight,
}) => {
  const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [updateSizeTime, setUpdateSizeTime] = useState(new Date().getTime());

  const {
    turn,
    lineEnds,
    dispatch,
    activeQuote,
    paragraphQuotes: quotes,
  } = useTurnContext();

  const topQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'top';
  }).length;

  const bottomQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'bottom';
  }).length;

  const {
    _id: turnId,
    contentType,
    backgroundColor,
    fontColor,
    paragraph,
    scrollPosition,
  } = turn;

  const {
    setInteractionMode,
    interactionType,
    bottomPanelSettings: { setPanelType },
  } = useInteractionContext();

  const {
    debugData: { updateDebugLines },
  } = useUiContext();

  const recalculateQuotes = () => {
    setQuotesLoaded(false);
    setQuotesWithCoords([]);
    setUpdateSizeTime(new Date().getTime());
  };

  const onQuoteClick = (quoteId) => {
    dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId, quoteId } });
  };

  const paragraphEl = useRef(null);

  // const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  // const [quotesLoaded, setQuotesLoaded] = useState(false);

  useEffect(() => {
    if (isActive && interactionType === INTERACTION_UNCOMPRESS_PARAGRAPH) {
      setTextPieces([]);
      setCompressedHeight(null);
      setTimeout(() => {
        turnReturnPreviousHeight();
      }, 300);
    }

    console.log('check 1');
    if (isActive && interactionType === INTERACTION_COMPRESS_PARAGRAPH) {
      console.log('check 2');
      turnSavePreviousHeight();

      const textPieces = calculateTextPiecesFromQuotes(
        quotesWithCoords,
        paragraphEl
      );

      consoleLogLines(textPieces, updateDebugLines);

      // сообщаем шагу, что у нас есть настройки параграфа для операции Compress
      setTextPieces(textPieces);
    }
    // @todo: отправить информацию о том, что мы вышли из режима Compress
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
        return compressedHeight || paragraphEl.current.scrollHeight;
      },
    });
    return () => unregisterHandleResize({ id: 'paragraph' }); // return будет вызван только в момент unmount
  }, [paragraphEl, compressedHeight]);

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
        payload: { turnId, quotesInfo: quotesWithCoords },
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
        dispatch({
          type: ACTION_TURN_WAS_CHANGED,
          payload: {
            _id: turnId,
            wasChanged: true,
            scrollPosition: Math.floor(paragraphEl.current.scrollTop),
          },
        });
      } else {
      }
    };

    paragraphEl.current.addEventListener('scroll', scrollHandler);
    // @todo: removeEventListener scroll
    return () => {
      if (!!paragraphEl.current)
        paragraphEl.current.removeEventListener('scroll', scrollHandler);
    };
  }, [paragraphEl]);

  return (
    <>
      <ParagraphOriginal
        {...{
          topQuotesCount,
          bottomQuotesCount,
          updateSizeTime,
          setQuotesWithCoords,
          variableHeight,
        }}
      />
      {quotesWithCoords.map((quote, i) => {
        // все цитаты
        let bordered = !!lineEnds[`${quote.turnId}_${quote.quoteId}`]; // проверка нужно показывать рамку или нет
        let outline = '0px solid transparent';
        if (
          activeQuote &&
          activeQuote.turnId === turnId &&
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

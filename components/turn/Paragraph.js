import { useRef, useEffect, useState } from 'react';
import {
  ACTION_QUOTE_COORDS_UPDATED,
  ACTION_QUOTE_CLICKED,
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
  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);

  const {
    turn,
    lineEnds,
    dispatch,
    activeQuote,
    paragraphQuotes: quotes,
  } = useTurnContext();

  const { _id: turnId } = turn;

  const {
    setInteractionMode,
    interactionType,
    bottomPanelSettings: { setPanelType },
  } = useInteractionContext();

  const {
    debugData: { updateDebugLines },
  } = useUiContext();

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

    if (isActive && interactionType === INTERACTION_COMPRESS_PARAGRAPH) {
      turnSavePreviousHeight();

      const textPieces = calculateTextPiecesFromQuotes(
        quotesWithCoords,
        paragraphElCurrent
      );

      consoleLogLines(textPieces, updateDebugLines);

      // сообщаем шагу, что у нас есть настройки параграфа для операции Compress
      setTextPieces(textPieces);
    }
    // @todo: отправить информацию о том, что мы вышли из режима Compress
  }, [isActive, interactionType]);

  useEffect(() => {
    if (!paragraphElCurrent) return;
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
        if (!paragraphElCurrent) {
          return 0;
        }
        return compressedHeight || paragraphElCurrent.scrollHeight;
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

  return (
    <>
      <ParagraphOriginal
        {...{
          updateSizeTime,
          setQuotesWithCoords,
          variableHeight,
          quotesWithCoords,
          setQuotesLoaded,
          setUpdateSizeTime,
          setParagraphElCurrent,
        }}
      />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          makeWidgetActive();
        }}
      >
        <i className="fas fa-highlighter"></i>
      </a>
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

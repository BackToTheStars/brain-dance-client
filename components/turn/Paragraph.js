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
import Compressor from './paragraph/Compressor';

// const delayRenderScroll = 20;

const Paragraph = ({
  registerHandleResize,
  unregisterHandleResize,
  // variableHeight,
  // quotesWithCoords,
  // setQuotesWithCoords,
  makeWidgetActive,
  isActive,
  turnSavePreviousHeight,
  handleResize,
}) => {
  const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [updateSizeTime, setUpdateSizeTime] = useState(new Date().getTime());
  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  const [textPieces, setTextPieces] = useState([]);
  const [compressedHeight, setComp] = useState(null);
  const [prevHeight, setPrevHeight] = useState(null);

  const setCompressedHeight = (newComp) => {
    console.trace();
    console.log({ newComp });
    setComp(newComp);
  };

  const {
    turn,
    lineEnds,
    dispatch,
    activeQuote,
    paragraphQuotes: quotes,
  } = useTurnContext();

  const { _id: turnId, width } = turn;

  const {
    setInteractionMode,
    interactionType,
    bottomPanelSettings: { setPanelType },
  } = useInteractionContext();

  const {
    debugData: { updateDebugLines },
  } = useUiContext();

  const paragraphEl = useRef(null);

  const onQuoteClick = (quoteId) => {
    dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId, quoteId } });
  };

  // const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  // const [quotesLoaded, setQuotesLoaded] = useState(false);

  useEffect(() => {
    if (isActive && interactionType === INTERACTION_UNCOMPRESS_PARAGRAPH) {
      setTextPieces([]);
      setCompressedHeight(null);
      setTimeout(() => {
        handleResize(width, 700);
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
        console.log({ compressedHeight });
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
      {!!textPieces.length && (
        <Compressor
          {...{
            textPieces,
            // contentType,
            // backgroundColor,
            // fontColor,
            // variableHeight,
            compressedHeight,
            setCompressedHeight,
            // registerHandleResize,
            // unregisterHandleResize,
          }}
        />
      )}
      <ParagraphOriginal
        {...{
          updateSizeTime,
          setQuotesWithCoords,
          // variableHeight,
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

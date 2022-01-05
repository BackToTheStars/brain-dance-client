import { useRef, useEffect, useState } from 'react';
import { ParagraphTextWrapper } from './functions';
import {
  ACTION_QUOTE_COORDS_UPDATED,
  ACTION_QUOTE_CLICKED,
  ACTION_TURN_WAS_CHANGED,
} from '../contexts/TurnsCollectionContext';
import { quoteRectangleThickness } from '../сonst';
import {
  MODE_GAME,
  INTERACTION_COMPRESS_PARAGRAPH,
  INTERACTION_UNCOMPRESS_PARAGRAPH,
  PANEL_LINES,
  useInteractionContext,
} from '../contexts/InteractionContext';
import { useUiContext } from '../contexts/UI_Context';
import { freeSpaceRequired } from '../сonst';
import { useTurnContext } from '../contexts/TurnContext';

// const delayRenderScroll = 20;

const Paragraph = ({
  setTextPieces,
  updateSizeTime,
  registerHandleResize,
  unregisterHandleResize,
  variableHeight,
  quotes,
  quotesWithCoords,
  setQuotesWithCoords,
  quotesLoaded,
  setQuotesLoaded,
  recalculateQuotes,
  makeWidgetActive,
  isActive,
  compressedHeight,
  setCompressedHeight,
  turnSavePreviousHeight,
  turnReturnPreviousHeight,
}) => {
  const topQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'top';
  }).length;
  const bottomQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'bottom';
  }).length;

  const { turn, lineEnds, dispatch, activeQuote } = useTurnContext();
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

      const textQuotesVerticalPositions = quotesWithCoords.map((quote) => ({
        top: quote.initialCoords.top + paragraphEl.current.scrollTop - 40, // @todo: использовать положение параграфа
        height: quote.initialCoords.height,
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

      // const freeSpaceRequired = 59;
      // @todo отдельно просчитать случай с одной цитатой

      for (let i = 0; i < textQuotesVerticalPositions.length; i++) {
        const quote = textQuotesVerticalPositions[i];

        if (i === 0) {
          // первый textPiece
          textPiece.height =
            Math.min(quote.top, freeSpaceRequired) + quote.height; // остановка внизу цитаты
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
          const realScrollHeight =
            paragraphEl.current.scrollHeight - textPiece.top;

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

      // --------- console log lines

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
      // ---------- end

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
      <p
        className="paragraphText original-text"
        ref={paragraphEl}
        style={style}
      >
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

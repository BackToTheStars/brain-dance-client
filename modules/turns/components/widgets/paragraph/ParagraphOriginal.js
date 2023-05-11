import {
  PARAGRAPH_SCROLL_TIMEOUT_DELAY,
  TURN_SCROLL_TIMEOUT_DELAY,
} from '@/config/ui';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import {
  changeParagraphStage,
  markTurnAsChanged,
  updateScrollPosition,
} from '@/modules/turns/redux/actions';
// import { setCallsQueueIsBlocked } from '@/modules/ui/redux/actions';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';
import {
  getParagraphQuotesWithoutScroll,
  getScrolledQuotes,
} from '../../helpers/quotesHelper';
import { getParagraphStage } from '../../helpers/stageHelper';
import {
  ORIG_LOADING,
  ORIG_READY,
  ORIG_READY_TO_RECEIVE_PARAMS,
} from './settings';

// import { ACTION_TURN_WAS_CHANGED } from '@/components/contexts/TurnsCollectionContext';
import {
  ParagraphOriginalTexts,
  // ParagraphOriginalTextWrapper,
} from './TextWrappers';
// import { useTurnData } from '../contexts/TurnData';

const paragraphScrollQueue = getQueue(PARAGRAPH_SCROLL_TIMEOUT_DELAY);
const turnScrollQueue = getQueue(TURN_SCROLL_TIMEOUT_DELAY);

const ParagraphOriginal = ({
  setParagraphElCurrent,
  // stateIsReady,
  turnId,
  notRegisteredWidgetsCount,
  // setParagraphIsReady,
}) => {
  const turn = useSelector((state) => state.turns.d[turnId]);
  const {
    compressed,
    paragraph,
    _id: turnId,
    backgroundColor,
    fontColor,
    contentType,
    scrollPosition,
    width,
    height,
    wasReady,
  } = turn;

  const stage = getParagraphStage(turn);

  const paragraphEl = useRef(null);
  const dispatch = useDispatch();

  const [scrollTop, setScrollTop] = useState(scrollPosition); // дополнительный локальный стейт для быстрого ререндера цитат
  const [quotesWithoutScroll, setQuotesWithoutScroll] = useState([]);

  const style = {};

  if (contentType === 'comment') {
    style.backgroundColor = backgroundColor;
    style.color = fontColor || 'black';
  }
  if (compressed) {
    style.visibility = 'hidden';
    style.position = 'absolute';
  }
  // if (!!variableHeight) {
  //   style.height = `${variableHeight}px`;
  // }

  // const topQuotesCount = quotesWithCoords.filter((quote) => {
  //   return !!lineEnds[quote.quoteKey] && quote.position === 'top';
  // }).length;

  // const bottomQuotesCount = quotesWithCoords.filter((quote) => {
  //   return !!lineEnds[quote.quoteKey] && quote.position === 'bottom';
  // }).length;

  // PARAGRAPH STAGE OF STATE MACHINE (same in Compressor.js)
  useEffect(() => {
    dispatch(changeParagraphStage(turnId, ORIG_LOADING));
  }, []);

  useEffect(() => {
    // полностью пересчитываем расположение цитат
    const quotes = getParagraphQuotesWithoutScroll(turnId, paragraphEl);
    setQuotesWithoutScroll(quotes);
    dispatch(
      quoteCoordsUpdate(
        turnId,
        TYPE_QUOTE_TEXT,
        getScrolledQuotes(quotes, paragraphEl, scrollTop)
      )
    );

    // dispatch(markTurnAsChanged({ _id: turnId }));
  }, [width]);

  // useEffect(() => {

  // }, [width, wasReady]);

  useEffect(() => {
    if (!quotesWithoutScroll.length) return;
    // обновляем только вертикальное расположение цитат
    turnScrollQueue.add(() => {
      dispatch(
        quoteCoordsUpdate(
          turnId,
          TYPE_QUOTE_TEXT,
          getScrolledQuotes(quotesWithoutScroll, paragraphEl, scrollTop)
        )
      );

      dispatch(markTurnAsChanged({ _id: turnId }));
    });
  }, [height, scrollTop, wasReady]); // stage, stateIsReady
  // @todo: нужно учитывать stage

  useEffect(() => {
    if (paragraphEl?.current) setParagraphElCurrent(paragraphEl.current);
  }, [paragraphEl]);

  useEffect(() => {
    paragraphEl.current.scrollTop = scrollPosition;
    if (!!notRegisteredWidgetsCount) return;
    // @todo: дождаться сигналы завершения от всех внутренних компонентов
    // проверить что очередь заблокирована
    setTimeout(() => {
      // dispatch(setCallsQueueIsBlocked(false));
      dispatch(changeParagraphStage(turnId, ORIG_READY_TO_RECEIVE_PARAMS));
    }, 300);
  }, [notRegisteredWidgetsCount]);

  useEffect(() => {
    if (!paragraphEl || !paragraphEl.current) return;

    const scrollHandler = () => {
      if (!!paragraphEl.current) {
        setScrollTop(paragraphEl.current.scrollTop);

        paragraphScrollQueue.add(() => {
          dispatch(
            updateScrollPosition({
              _id: turnId,
              scrollPosition: Math.floor(paragraphEl.current.scrollTop),
            })
          );
          // @todo: сообщить сервисам минимапа и линий
        });

        // dispatch({
        //   type: ACTION_TURN_WAS_CHANGED,
        //   payload: {
        //     _id: turnId,
        //     wasChanged: true,
        //     scrollPosition: Math.floor(paragraphEl.current.scrollTop),
        //   },
        // });
      } else {
      }
    };

    paragraphEl.current.addEventListener('scroll', scrollHandler);

    return () => {
      if (!!paragraphEl.current)
        paragraphEl.current.removeEventListener('scroll', scrollHandler);
    };
  }, [paragraphEl]);

  return (
    <div className="wrapperParagraphText" style={style}>
      <p
        className="paragraphText original-text noselect"
        ref={paragraphEl}
        style={style}
      >
        {/* {!!topQuotesCount && (
            <span className="top-quotes-counter">{topQuotesCount}</span>
          )} */}
        {/* <ParagraphOriginalTextWrapper */}
        <ParagraphOriginalTexts
          arrText={paragraph || []}
          turnId={turnId}
          turnType={contentType}
        />
        {/* {!!bottomQuotesCount && (
            <span className="bottom-quotes-counter">{bottomQuotesCount}</span>
          )} */}
      </p>
    </div>
  );
};

// export default React.memo(ParagraphOriginal);

export default ParagraphOriginal;

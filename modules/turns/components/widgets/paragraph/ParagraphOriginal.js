import { PARAGRAPH_SCROLL_TIMEOUT_DELAY } from '@/config/ui';
import {
  markTurnAsChanged,
  updateScrollPosition,
} from '@/modules/turns/redux/actions';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';
import {
  getParagraphQuotesWithoutScroll,
  getScrolledQuotes,
} from '../../helpers/quotesHelper';

// import { ACTION_TURN_WAS_CHANGED } from '@/components/contexts/TurnsCollectionContext';
import { ParagraphOriginalTextWrapper } from './TextWrappers';
// import { useTurnData } from '../contexts/TurnData';

const paragraphScrollQueue = getQueue(PARAGRAPH_SCROLL_TIMEOUT_DELAY);

const ParagraphOriginal = ({
  // updateSizeTime = 0,
  // setQuotesWithCoords = () => {},
  // quotesWithCoords= [],
  // setQuotesLoaded = () => {},
  // setUpdateSizeTime = () => {},
  setParagraphQuotes,
  // turn,
  setParagraphElCurrent,

  paragraph,
  _id: turnId,
  backgroundColor,
  fontColor,
  contentType,
  scrollPosition,
  width,
  height,
  stateIsReady,
}) => {
  //
  // const { lineEnds, dispatch } = useTurnData() || {};
  // const {
  //   paragraph,
  //   _id: turnId,
  //   backgroundColor,
  //   fontColor,
  //   contentType,
  //   scrollPosition,
  //   width,
  //   height,
  // } = turn;

  const paragraphEl = useRef(null);
  const dispatch = useDispatch();

  const [scrollTop, setScrollTop] = useState(scrollPosition); // дополнительный локальный стейт для быстрого ререндера цитат
  const [quotesWithoutScroll, setQuotesWithoutScroll] = useState([]);

  const style = {};

  if (contentType === 'comment') {
    style.backgroundColor = backgroundColor;
    style.color = fontColor || 'black';
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

  useEffect(() => {
    // полностью пересчитываем расположение цитат
    const quotes = getParagraphQuotesWithoutScroll(turnId, paragraphEl);
    setQuotesWithoutScroll(quotes);
    setParagraphQuotes(getScrolledQuotes(quotes, paragraphEl, scrollTop));
  }, [width]);

  useEffect(() => {
    if (!quotesWithoutScroll.length) return;
    // обновляем только вертикальное расположение цитат
    setParagraphQuotes(
      getScrolledQuotes(quotesWithoutScroll, paragraphEl, scrollTop)
    );
    dispatch(markTurnAsChanged({ _id: turnId }));
  }, [height, scrollTop, stateIsReady]);

  useEffect(() => {
    if (paragraphEl?.current) setParagraphElCurrent(paragraphEl.current);
  }, [paragraphEl]);

  useEffect(() => {
    paragraphEl.current.scrollTop = scrollPosition;
  }, []);

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
        <ParagraphOriginalTextWrapper
          arrText={paragraph || []}
          turnId={turnId}
        />
        {/* {!!bottomQuotesCount && (
            <span className="bottom-quotes-counter">{bottomQuotesCount}</span>
          )} */}
      </p>
    </div>
  );
};

export default React.memo(ParagraphOriginal);

import { useEffect, useRef } from 'react';
import { useTurnContext } from '../../contexts/TurnContext';
import { ParagraphTextWrapper } from './functions';
import { ACTION_TURN_WAS_CHANGED } from '../../contexts/TurnsCollectionContext';

const ParagraphOriginal = ({
  updateSizeTime,
  setQuotesWithCoords,
  variableHeight,
  quotesWithCoords,
  setQuotesLoaded,
  setUpdateSizeTime,
  setParagraphElCurrent,
}) => {
  //
  const { turn, lineEnds, dispatch } = useTurnContext();
  const {
    paragraph,
    _id: turnId,
    backgroundColor,
    fontColor,
    contentType,
    scrollPosition,
  } = turn;

  const paragraphEl = useRef(null);

  const style = {};

  if (contentType === 'comment') {
    style.backgroundColor = backgroundColor;
    style.color = fontColor || 'black';
  }
  if (!!variableHeight) {
    style.height = `${variableHeight}px`;
  }

  const topQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'top';
  }).length;

  const bottomQuotesCount = quotesWithCoords.filter((quote) => {
    return !!lineEnds[quote.quoteKey] && quote.position === 'bottom';
  }).length;

  const recalculateQuotes = () => {
    setQuotesLoaded(false);
    setQuotesWithCoords([]);
    setUpdateSizeTime(new Date().getTime());
  };

  useEffect(() => {
    if (paragraphEl?.current) setParagraphElCurrent(paragraphEl.current);
  }, [paragraphEl]);

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
    <p className="paragraphText original-text" ref={paragraphEl} style={style}>
      {!!topQuotesCount && (
        <span className="top-quotes-counter">{topQuotesCount}</span>
      )}
      <ParagraphTextWrapper
        arrText={paragraph || []}
        updateSizeTime={updateSizeTime}
        setQuotes={setQuotesWithCoords}
        turnId={turnId}
      />
      {!!bottomQuotesCount && (
        <span className="bottom-quotes-counter">{bottomQuotesCount}</span>
      )}
    </p>
  );
};

export default ParagraphOriginal;

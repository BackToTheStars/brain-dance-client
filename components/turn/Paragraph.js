import { useRef, useEffect } from 'react';
import { ParagraphTextWrapper } from './functions';

const Paragraph = ({
  contentType,
  backgroundColor,
  fontColor,
  paragraph,
  updateSizeTime,
  registerHandleResize,
  variableHeight,
}) => {
  // topQuotesCount,
  const topQuotesCount = 0;
  // bottomQuotesCount,
  const bottomQuotesCount = 0;
  const setQuotesWithCoords = () => {};
  const onQuoteClick = () => {};

  const paragraphEl = useRef(null);

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

  const style = {};

  if (contentType === 'comment') {
    style.backgroundColor = backgroundColor;
    style.color = fontColor || 'black';
  }
  if (!!variableHeight) {
    style.height = `${variableHeight}px`;
  }

  return (
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
  );
};

export default Paragraph;

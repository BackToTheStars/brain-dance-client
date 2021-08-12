import { useRef, useEffect } from 'react';
import { ParagraphTextWrapper } from './functions';

const Paragraph = ({
  contentType,
  backgroundColor,
  fontColor,
  paragraph,
  updateSizeTime,
  registerHandleResize,
}) => {
  // topQuotesCount,
  const topQuotesCount = 0;
  // bottomQuotesCount,
  const bottomQuotesCount = 0;
  const setQuotesWithCoords = () => {};
  const onQuoteClick = () => {};

  const paragraphEl = useRef(null);

  useEffect(() => {
    registerHandleResize({
      type: 'paragraph',
      id: 'paragraph',
      minWidthCallback: () => {
        return 300;
      },
      minHeightCallback: () => {
        return 50;
      },
      maxHeightCallback: () => {
        return 1000;
      },
    });
  }, []);

  return (
    <p
      className="paragraphText"
      ref={paragraphEl}
      style={
        contentType === 'comment'
          ? { backgroundColor, color: fontColor || 'black' }
          : {}
      }
    >
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

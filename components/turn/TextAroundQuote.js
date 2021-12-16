import { useRef, useEffect } from 'react';
import { ParagraphTextWrapper } from './ParagraphTextWrapper';

const TextAroundQuote = ({
  // contentType,
  // backgroundColor,
  // fontColor,
  // registerHandleResize,
  // unregisterHandleResize,
  // variableHeight,

  paragraph,
  scrollPosition,
  height, // через этот viewport смотрим на кусок текста
}) => {
  //
  const paragraphEl = useRef(null);

  useEffect(() => {
    paragraphEl.current.scrollTop = scrollPosition;
  }, []);

  return (
    <div
      className="paragraphText"
      ref={paragraphEl}
      style={{ height: `${height}px` }}
    >
      <ParagraphTextWrapper {...{ arrText: paragraph }} />
    </div>
  );
};

export default TextAroundQuote;

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
    setTimeout(() => {
      paragraphEl.current.scrollTop = scrollPosition;
      const quotes = [
        ...paragraphEl.current.querySelectorAll('.compressed-quote'),
      ];

      const { top } = quotes[0].getBoundingClientRect();
      const { bottom } = quotes[quotes.length - 1].getBoundingClientRect();
      const middleLine = (top + bottom) / 2;
      const { top: paragraphTop, bottom: paragraphBottom } =
        paragraphEl.current.getBoundingClientRect();
      const middleLineParagraph = (paragraphTop + paragraphBottom) / 2;
      const fixScroll = Math.floor(middleLineParagraph - middleLine);
      paragraphEl.current.scrollTop -= fixScroll;
      // for (let quote of quotes) {
      // const { top, bottom } = quote.getBoundingClientRect();
      // }
      // console.log(middleLine, ' ', middleLineParagraph);
    }, 300);
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

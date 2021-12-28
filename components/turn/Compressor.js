import { Fragment, useRef, useState } from 'react';
import { useEffect } from 'react/cjs/react.development';
import { ParagraphTextWrapper } from './ParagraphTextWrapper';
import TextAroundQuote from './TextAroundQuote';

const Compressor = ({
  width,
  paragraph: originalParagraph,
  textPieces: originalTextPieces,
  paragraphTop,
  setCompressedHeight,
  // contentType,
  // backgroundColor,
  // fontColor,
  // registerHandleResize,
  // unregisterHandleResize,
  // variableHeight,
}) => {
  //
  const [compressedTexts, setCompressedTexts] = useState([]);
  //
  const paragraph = originalParagraph.map((paragraphItem) => ({
    ...paragraphItem,
  }));
  const wrapperRef = useRef(null); // @learn null это мы, undefined, это система

  // @fixme: цитата делит одно слово на несколько слов
  const words = paragraph
    .map((textItem) => textItem.insert)
    .join(' ')
    .split(' '); // слили всё в один большой текст и разделили по словам

  useEffect(() => {
    if (!wrapperRef.current) return false;
    const spans = [...wrapperRef.current.querySelectorAll('span, br')]; // @learn возвращает коллекцию

    let maxHeightPlusTop = 0;
    let lettersCount = 0;
    let textPieceIndex = 0;

    const textPieces = originalTextPieces.map((textPiece) => ({
      ...textPiece,
    }));

    textPieces[0].delta = 0;

    textPieces[textPieceIndex].startLettersCount = lettersCount;

    const filteredSpans = spans.filter((span) => {
      if (span.parentNode.style.background) return false;
      if (
        !span.style.background &&
        span.parentNode.classList.contains('compressor')
      )
        return false;
      return true;
    });

    // const tempTurnTop = 26;
    console.log('===============');
    for (let span of filteredSpans) {
      const { height, top: absoluteTop } = span.getBoundingClientRect();
      const top = absoluteTop - paragraphTop;
      // console.log('span', height, top);
      if (height + top > maxHeightPlusTop) {
        maxHeightPlusTop = height + top;
        // console.log({ maxHeightPlusTop });
        if (textPieceIndex < textPieces.length - 1) {
          if (textPieces[textPieceIndex + 1].top < maxHeightPlusTop) {
            textPieceIndex += 1;
            console.log('new textPieceIndex', textPieceIndex);
            textPieces[textPieceIndex].startLettersCount = lettersCount;
            textPieces[textPieceIndex].delta =
              maxHeightPlusTop - textPieces[textPieceIndex].top;
          }
        }
      }
      lettersCount += span.innerText.length;
      if (span.tagName === 'BR') {
        // if (span.parentNode.tagName !== 'SPAN') {
        // если br находится в span
        lettersCount += 1;
        // } else {
        // debugger;
        // }
      }
      // console.log({ lettersCount });
    }
    console.log('===============');
    console.log(textPieces);
    console.log(paragraph);

    let paragraphCountingBuffer = [];
    lettersCount = 0;
    let paragraphIndex = 0;

    for (let i = 0; i < textPieces.length - 1; i += 1) {
      const { startLettersCount } = textPieces[i + 1];

      for (let j = paragraphIndex; j < paragraph.length; j += 1) {
        const insertLength = paragraph[j].insert.length;
        if (insertLength + lettersCount === startLettersCount) {
          console.log('if 1');
          // решить, делать ли копию
          paragraphCountingBuffer.push(paragraph[j]);
          paragraphIndex = j + 1;
          textPieces[i].paragraph = paragraphCountingBuffer;
          paragraphCountingBuffer = [];
          lettersCount += insertLength;
          break; // @learn - breaks работает для while, for, switch
          //
        } else if (insertLength + lettersCount < startLettersCount) {
          // console.log('if 2', insertLength + lettersCount, startLettersCount);
          paragraphCountingBuffer.push(paragraph[j]);
          lettersCount += insertLength;
          //
        } else if (insertLength + lettersCount > startLettersCount) {
          console.log('if 3', insertLength + lettersCount, startLettersCount);
          // const difference = insertLength + lettersCount - startLettersCount;
          const difference = startLettersCount - lettersCount;
          paragraphCountingBuffer.push({
            insert: paragraph[j].insert.slice(0, difference),
          });
          paragraph.splice(j + 1, 0, {
            insert: paragraph[j].insert.slice(difference),
          });
          paragraph[j].insert = paragraph[j].insert.slice(0, difference);
          paragraphIndex = j + 1;
          textPieces[i].paragraph = paragraphCountingBuffer;
          paragraphCountingBuffer = [];
          // lettersCount -= insertLength;
          lettersCount += difference;
          break;
          //
        }
      }
    }
    // console.log('завершение цикла');
    textPieces[textPieces.length - 1].paragraph =
      paragraph.slice(paragraphIndex);
    setCompressedTexts(textPieces);

    setCompressedHeight(
      textPieces.reduce((sum, textPiece) => sum + textPiece.height, 0)
    );
    console.log({ textPieces });
  }, [width]);

  return (
    <>
      <div
        ref={wrapperRef}
        className="compressor paragraphText"
        style={{ width: `${width}px` }}
      >
        <ParagraphTextWrapper {...{ arrText: paragraph }} />
        {/* {words.map((word, i) => {
          const arrWords = word ? word.split('\n') : [];
          const newWords = [];
          for (let j = 0; j < arrWords.length; j++) {
            newWords.push(<span key={j * 3}>{arrWords[j]}</span>);
            newWords.push(<span key={j * 3 + 1}> </span>);
            newWords.push(<br key={j * 3 + 2} />);
          }
          // console.log({ newWords });
          newWords.pop();
          // newWords.pop();
          return <Fragment key={`${i}`}>{newWords}</Fragment>;
        })} */}
      </div>
      <div className="compressed-paragraph-widget">
        {compressedTexts.map((text, i) => {
          return (
            <TextAroundQuote
              key={i}
              {...{
                // contentType,
                // backgroundColor,
                // fontColor,
                // registerHandleResize,
                // unregisterHandleResize,
                // variableHeight,

                paragraph: text.paragraph,
                scrollPosition: text.scrollTop + text.delta,
                // scrollPosition: text.scrollTop,
                height: text.height, // через этот viewport смотрим на кусок текста
                // height: text.scrollHeight,
              }}
            />
          );
        })}
      </div>
    </>
  );
};

export default Compressor;

import { Fragment, useRef } from 'react';
import { useEffect } from 'react/cjs/react.development';

const Compressor = ({ width, paragraph: originalParagraph, textPieces }) => {
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
    const spans = wrapperRef.current.querySelectorAll('span');

    let maxHeightPlusTop = 0;
    let lettersCount = 0;
    let textPieceIndex = 0;

    textPieces[textPieceIndex].startLettersCount = lettersCount;

    for (let span of spans) {
      const { height, top } = span.getBoundingClientRect();

      if (height + top > maxHeightPlusTop) {
        maxHeightPlusTop = height + top;
        console.log(maxHeightPlusTop);
        if (textPieceIndex < textPieces.length - 1) {
          if (textPieces[textPieceIndex + 1].top < maxHeightPlusTop) {
            // textPieceIndex++;
            console.log((textPieceIndex += 1));
            textPieces[textPieceIndex].startLettersCount = lettersCount;
          }
        }
        lettersCount += span.innerText.length;
      } else {
        lettersCount += span.innerText.length;
      }
    }
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
          console.log('if 2', insertLength + lettersCount, startLettersCount);
          paragraphCountingBuffer.push(paragraph[j]);
          lettersCount += insertLength;
          //
        } else if (insertLength + lettersCount > startLettersCount) {
          console.log('if 3', insertLength + lettersCount, startLettersCount);
          const difference = insertLength + lettersCount - startLettersCount;
          paragraphCountingBuffer.push(
            paragraph[j].insert.slice(0, difference)
          );
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
    console.log('завершение цикла');
    textPieces[textPieces.length - 1].paragraph = paragraphCountingBuffer;
    console.log({ textPieces });
  }, [width]);

  return (
    <div
      ref={wrapperRef}
      className="compressor paragraphText"
      style={{ width: `${width}px` }}
    >
      {words.map((word, i) => {
        const arrWords = word ? word.split('\n') : [];
        const newWords = [];
        for (let j = 0; j < arrWords.length; j++) {
          newWords.push(<span key={j * 3}>{arrWords[j]}</span>);
          newWords.push(<span key={j * 3 + 1}> </span>);
          newWords.push(<br key={j * 3 + 2} />);
        }
        newWords.pop();
        // newWords.pop();
        return <Fragment key={`${i}`}>{newWords}</Fragment>;
      })}
    </div>
  );
};

export default Compressor;

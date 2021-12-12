import { Fragment, useRef } from 'react';

const Compressor = ({ width, paragraph, textPieces }) => {
  //
  const wrapperRef = useRef(null); // @learn null это мы, undefined, это система

  // @fixme: цитата делит одно слово на несколько слов
  const words = paragraph
    .map((textItem) => textItem.insert)
    .join(' ')
    .split(' '); // слили всё в один большой текст и разделили по словам

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

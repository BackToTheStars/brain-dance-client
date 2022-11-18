import { setCallsQueueIsBlocked } from '@/modules/ui/redux/actions';
import { Fragment, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react/cjs/react.development';
import { getParagraphQuotesWithoutScroll } from '../../helpers/quotesHelper';
import {
  ParagraphCompressorTextWrapper,
  TextAroundQuote,
} from './TextWrappers';
// import { useTurnContext } from '../../contexts/TurnContext';
// import { ParagraphTextWrapper } from '../ParagraphTextWrapper';
// import TextAroundQuote from '../TextAroundQuote';

const Compressor = ({
  turn,
  textPieces: originalTextPieces,
  compressedHeight,
  setCompressedHeight,
  stateIsReady,
  // contentType,
  // backgroundColor,
  // fontColor,
  // registerHandleResize,
  // unregisterHandleResize,
  // variableHeight,
  paragraphElCurrent,
  setParagraphElCurrent,
}) => {
  //
  // const { turn } = useTurnContext();
  const dispatch = useDispatch();
  const { _id: turnId, width, paragraph: originalParagraph, y } = turn;
  const [compressedTexts, setCompressedTexts] = useState([]);
  const [textsReadyCount, setTextsReadyCount] = useState(0);

  //
  const paragraph = originalParagraph.map((paragraphItem) => ({
    ...paragraphItem,
  }));
  const wrapperRef = useRef(null); // @learn null это мы, undefined, это система

  // let paragraphTop = y + 40; // @todo: верх виджета параграфа под header, picture
  // if (wrapperRef?.current) {
  //   const { top } = wrapperRef.current.getBoundingClientRect();
  //   paragraphTop = top;
  // }
  // console.log({ paragraphTop })

  // @fixme: цитата делит одно слово на несколько слов
  const words = paragraph
    .map((textItem) => textItem.insert)
    .join(' ')
    .split(' '); // слили всё в один большой текст и разделили по словам

  const setTextIsReady = () => setTextsReadyCount((count) => count + 1);

  useEffect(() => {
    // console.log({ compressedHeight });
    // console.log({ originalTextPieces });
    // console.log({ wrapperRef });

    if (!wrapperRef.current) return false;
    const quotes = getParagraphQuotesWithoutScroll(turnId, wrapperRef);
    console.log({ quotes });

    // setQuotesWithoutScroll(quotes);
    // setParagraphQuotes(getScrolledQuotes(quotes, paragraphEl, scrollTop));
  }, [stateIsReady, wrapperRef]);

  useEffect(() => {
    if (!wrapperRef.current) return false;
    if (!originalTextPieces?.length) return false;

    const { top: paragraphTop } = wrapperRef.current.getBoundingClientRect();

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
    console.log({ textPieces, filteredSpans });

    // const tempTurnTop = 26;
    for (let span of filteredSpans) {
      const { height, top: absoluteTop } = span.getBoundingClientRect();
      const top = absoluteTop - paragraphTop;
      if (height + top > maxHeightPlusTop) {
        maxHeightPlusTop = height + top;
        if (textPieceIndex < textPieces.length - 1) {
          if (textPieces[textPieceIndex + 1].top < maxHeightPlusTop) {
            textPieceIndex += 1;
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
    }

    let paragraphCountingBuffer = [];
    lettersCount = 0;
    let paragraphIndex = 0;

    for (let i = 0; i < textPieces.length - 1; i += 1) {
      const { startLettersCount } = textPieces[i + 1];

      for (let j = paragraphIndex; j < paragraph.length; j += 1) {
        const insertLength = paragraph[j].insert.length;
        if (insertLength + lettersCount === startLettersCount) {
          // решить, делать ли копию
          paragraphCountingBuffer.push(paragraph[j]);
          paragraphIndex = j + 1;
          textPieces[i].paragraph = paragraphCountingBuffer;
          paragraphCountingBuffer = [];
          lettersCount += insertLength;
          break; // @learn - breaks работает для while, for, switch
          //
        } else if (insertLength + lettersCount < startLettersCount) {
          paragraphCountingBuffer.push(paragraph[j]);
          lettersCount += insertLength;
          //
        } else if (insertLength + lettersCount > startLettersCount) {
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
    textPieces[textPieces.length - 1].paragraph =
      paragraph.slice(paragraphIndex);
    setCompressedTexts(textPieces);

    setCompressedHeight(
      textPieces.reduce((sum, textPiece) => sum + textPiece.height, 0)
      // + (textPieces.length - 1) * 11 // todo: const
    );
    // setTimeout(() => {
    //   if (!!compressedHeight) setCompressedHeight(null);
    // }, 300);
  }, [width, wrapperRef, originalTextPieces]);

  useEffect(() => {
    if (!textsReadyCount) return;
    if (textsReadyCount === compressedTexts.length)
      dispatch(setCallsQueueIsBlocked(false));
  }, [textsReadyCount, compressedTexts]);

  return (
    <div className="wrapperParagraphText">
      <div style={{ position: 'relative' }}>
        <div
          ref={wrapperRef}
          className="compressor paragraphText"
          // style={{ width: `${width}px` }}
        >
          <ParagraphCompressorTextWrapper {...{ arrText: paragraph }} />
        </div>
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
                setTextIsReady,
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
    </div>
  );
};

export default Compressor;

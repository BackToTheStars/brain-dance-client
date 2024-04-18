// @fixme: цитата делит одно слово на несколько слов
// const words = paragraph
//   .map((textItem) => textItem.insert)
//   .join(' ')
//   .split(' '); // слили всё в один большой текст и разделили по словам

import { widgetSpacer } from '@/config/ui';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import {
  increment,
  startLoggingTime,
  stopLoggingTime,
} from '@/modules/telemetry/utils/logger';
import {
  changeParagraphStage,
  resetCompressedParagraphState,
} from '@/modules/turns/redux/actions';
// import { setCallsQueueIsBlocked } from '@/modules/ui/redux/actions';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getParagraphQuotesWithoutScroll } from '../../helpers/quotesHelper';
import { getParagraphStage } from '../../helpers/stageHelper';
import { paragraphStateSaveToLocalStorage } from '../../helpers/store';
import {
  COMP_LOADING,
  COMP_READY,
  COMP_READY_TO_RECEIVE_PARAMS,
} from './settings';
import {
  ParagraphCompressorTextWrapper,
  TextAroundQuoteOptimized,
} from './TextWrappers';
import { calculateTextPiecesFromQuotes } from './oldHelper';

const Compressor = ({
  turnId,
  widget,
  widgetId,
  setCompressedHeight,
  setWrapperElCurrent,
  registerHandleResizeWithParams,
}) => {
  const turn = useSelector((state) => state.turns.d[turnId].data);
  const width = useSelector((state) => state.turns.d[turnId].size.width);
  const dispatch = useDispatch();
  const {
    paragraph: originalParagraph,
    contentType,
    compressedParagraphState,
  } = turn;
  const stage = getParagraphStage(turn);
  const [compressedTexts, setCompressedTexts] = useState([]);
  const [textsReadyCount, setTextsReadyCount] = useState(0);
  const [compressedTextPieces, setCompressedTextPieces] = useState([]);
  const [quoteCollection, setQuoteCollection] = useState([]);

  const paragraph = originalParagraph.map((paragraphItem) => ({
    ...paragraphItem,
  }));
  const wrapperRef = useRef(null); // @learn null это мы, undefined, это система

  const setTextIsReady = () => setTextsReadyCount((count) => count + 1);

  const addToQuoteCollection = (quotesInfoPart, index) => {
    setQuoteCollection((quoteCollection) => {
      // callback потому что идём через useMemo, чтобы отвязаться от scope
      const quoteCollectionCopy = [...quoteCollection];
      quoteCollectionCopy[index] = quotesInfoPart;
      return quoteCollectionCopy;
    });
  };

  const classNameId = `turn_${turnId}_compressor_${widgetId}`;

  useEffect(() => {
    if (!quoteCollection.length) return;
    const count = quoteCollection.filter((q) => !!q).length;
    if (count !== compressedTexts.length) return;
    const quotesInfo = quoteCollection.reduce((acc, element) => {
      return [...acc, ...element];
    }, []);
    dispatch(quoteCoordsUpdate(turnId, 'text', quotesInfo));
  }, [quoteCollection]);

  // PARAGRAPH STAGE OF STATE MACHINE (same in ParagraphOriginal.js)

  useEffect(() => {
    dispatch(changeParagraphStage(turnId, COMP_LOADING));
    increment('CompressorInit');
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    if (stage !== COMP_LOADING) return;
    if (!!compressedParagraphState) {
      const { height, textPieces: textPiecesFromDB } = compressedParagraphState;
      setCompressedTextPieces(textPiecesFromDB);
      registerHandleResizeWithParams({
        widgetMinHeight: height,
        widgetMaxHeight: height,
        widgetDesiredHeight: 0, //stage === COMP_READY ? height : 0,
      });
      setCompressedTexts(textPiecesFromDB);
      setCompressedHeight(height);
      return;
    }
    const quotes = getParagraphQuotesWithoutScroll(turnId, wrapperRef);
    const textPieces = calculateTextPiecesFromQuotes(
      quotes,
      wrapperRef?.current
    );
    setCompressedTextPieces(textPieces);

    const widgetMinHeight = textPieces.reduce(
      (acc, textPiece) => acc + textPiece.height,
      0
    );
    const widgetMaxHeight = textPieces.reduce(
      (acc, textPiece) => acc + textPiece.scrollHeight,
      0
    );
    registerHandleResizeWithParams({
      widgetMinHeight,
      widgetMaxHeight,
      // widgetDesiredHeight: !!paragraphIsReady ? height : 0,
      widgetDesiredHeight: 0, //stage === COMP_READY ? height : 0,
    });
  }, [wrapperRef, stage]); //, height, stateIsReady, paragraphIsReady]);

  useEffect(() => {
    if (!!compressedParagraphState) {
      const { width: widthFromDB } = compressedParagraphState;
      if (width === widthFromDB) return;
    }
    dispatch(resetCompressedParagraphState(turnId));
  }, [width]);

  useEffect(() => {
    if (!compressedTextPieces?.length) return;
    if (!!compressedParagraphState) {
            const { width: widthFromDB } = compressedParagraphState;
      if (width === widthFromDB) return;
    }
    
    const { top: paragraphTop } = wrapperRef.current.getBoundingClientRect();

    const spans = [...wrapperRef.current.querySelectorAll('span, br')]; // @learn возвращает коллекцию

    let maxHeightPlusTop = 0;
    let lettersCount = 0;
    let textPieceIndex = 0;

    const textPieces = compressedTextPieces.map((textPiece) => ({
      ...textPiece,
    }));

    textPieces[0].delta = 0;

    textPieces[textPieceIndex].startLettersCount = lettersCount;

    const filteredSpans = spans.filter((span) => {
      if (span.parentNode.style.background) return;
      if (
        !span.style.background &&
        span.parentNode.classList.contains('compressor')
      )
        return;
      return true;
    });

    // const tempTurnTop = 26;
    for (let span of filteredSpans) {
      const { height, top: absoluteTop } = span.getBoundingClientRect();
      const top = absoluteTop - paragraphTop;
      if (height + top > maxHeightPlusTop) {
        maxHeightPlusTop = height + top;
        if (textPieceIndex < textPieces.length - 1) {
          if (textPieces[textPieceIndex + 1].top <= maxHeightPlusTop) {
            textPieces[textPieceIndex + 1].top = maxHeightPlusTop - height;
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

    // scrollHeight fixes
    const compressedScrollHeight = textPieces.reduce(
      (sum, textPiece) => sum + textPiece.scrollHeight,
      0
    );
    let acc = 0;
    for (let i = 1; i < textPieces.length; i += 1) {
      textPieces[i - 1].scrollHeight = textPieces[i].top - acc;
      acc += textPieces[i - 1].scrollHeight;
    }
    textPieces[textPieces.length - 1].scrollHeight =
      compressedScrollHeight - acc;

    // scrollTop fixes - когда цитата не по центру
    for (const textPiece of textPieces) {
      const centerLine =
        (textPiece.quotes[0].top +
          textPiece.quotes.at(-1).top +
          textPiece.quotes.at(-1).height) /
          2 -
        textPiece.top;
      textPiece.scrollTop = centerLine - textPiece.height / 2;
      // textPiece.scrollTop = (textPiece.scrollHeight - textPiece.height) / 2;
    }

    const height = textPieces.reduce(
      // высота виджета параграфа в сжатом состоянии
      (sum, textPiece) => sum + textPiece.height,
      0
    );

    paragraphStateSaveToLocalStorage({
      textPieces,
      turnId,
      height,
      width,
      updatedAt: Date.now(),
    });
    setCompressedTexts(textPieces);

    setCompressedHeight(height);
    // setTimeout(() => {
    //   if (!!compressedHeight) setCompressedHeight(null);
    // }, 300);
  }, [width, compressedTextPieces]); // , wrapperRef

  useEffect(() => {
        // console.log(
    //   `useEffect [textsReadyCount ${textsReadyCount}, compressedTexts ${compressedTexts}]`
    // );
    if (!textsReadyCount) return;
        if (textsReadyCount === compressedTexts.length) {
      setTimeout(() => {
        // dispatch(setCallsQueueIsBlocked(false));
        // setParagraphIsReady(true);
        dispatch(changeParagraphStage(turnId, COMP_READY_TO_RECEIVE_PARAMS));
      }, 50);
    }
  }, [textsReadyCount, compressedTexts]);

  useEffect(() => {
        if (wrapperRef?.current) setWrapperElCurrent(wrapperRef.current);
  }, [wrapperRef]);

  useEffect(() => {
        if (stage === COMP_READY) {
      stopLoggingTime('paragraphStageReady' + turnId);
    } else if (stage === COMP_READY_TO_RECEIVE_PARAMS) {
      startLoggingTime('paragraphStageReady' + turnId);
      stopLoggingTime('paragraphStageReceivePRMS' + turnId);
    } else if (stage === COMP_LOADING) {
      startLoggingTime('paragraphStageReceivePRMS' + turnId);
      stopLoggingTime('paragraphStageOther' + turnId);
    } else {
      startLoggingTime('paragraphStageOther' + turnId);
    }
  }, [stage]);

  const textsAroundQuotes = useMemo(() => {
    if (!widget) return [];

    let deltaTop = 0;
    let deltaScrollHeightTop = 0;
    // const widgetTop = wrapperRef.current.getBoundingClientRect().top - turn.y;
    let newDeltaScrollHightTop = 0;

    return compressedTexts.map((text, i) => {
      deltaTop += text.height;
      deltaScrollHeightTop += text.scrollHeight;

      return (
        <TextAroundQuoteOptimized
          index={i}
          addToQuoteCollection={addToQuoteCollection}
          key={i}
          arrText={text.paragraph || []}
          turnId={turnId}
          turnType={contentType}
          setTextIsReady={setTextIsReady}
          scrollPosition={text.scrollTop} // + text.delta}
          height={text.height}
          deltaTop={deltaTop - text.height}
          deltaScrollHeightTop={deltaScrollHeightTop - text.scrollHeight}
          widgetTop={widget?.minTop} // @todo: проверить widget?.minTop
          widgetWidth={widget?.width}
          quotes={text.quotes}
          parentClassNameId={classNameId}
        />
      );
    });
  }, [compressedTexts, widget]);

  const paragraphCompressorTextWrapper = useMemo(() => {
        return <ParagraphCompressorTextWrapper arrText={paragraph} />;
  }, []);

  return (
    <div className="wrapperParagraphText">
      <div style={{ position: 'relative' }}>
        <div ref={wrapperRef} className="compressor paragraphText">
          {stage !== COMP_READY &&
            !compressedParagraphState &&
            paragraphCompressorTextWrapper}
        </div>
      </div>
      <div className={`compressed-paragraph-widget ${classNameId}`}>
        {textsAroundQuotes}
      </div>
    </div>
  );
};

export default Compressor;

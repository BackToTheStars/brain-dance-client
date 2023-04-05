import { widgetSpacer } from '@/config/ui';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import {
  increment,
  startLoggingTime,
  stopLoggingTime,
} from '@/modules/telemetry/utils/logger';
import { changeParagraphStage } from '@/modules/turns/redux/actions';
// import { setCallsQueueIsBlocked } from '@/modules/ui/redux/actions';
import { calculateTextPiecesFromQuotes } from 'old/components/turn/paragraph/helper';
import { Fragment, useRef, useState, useEffect, useMemo } from 'react';
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
  ParagraphOriginalTexts,
  TextAroundQuote,
  TextAroundQuoteOptimized,
} from './TextWrappers';
import { useDevPanel } from '@/modules/panels/components/hooks/useDevPanel';

const Compressor = ({
  turnId,
  widget,
  widgetId,
  // textPieces: compressedTextPieces,
  // compressedHeight,
  setCompressedHeight,
  // stateIsReady,
  setWrapperElCurrent,
  registerHandleResizeWithParams,
  // setParagraphIsReady,
  // height,
  // paragraphIsReady,
  // contentType,
  // backgroundColor,
  // fontColor,
  // registerHandleResize,
  // unregisterHandleResize,
  // variableHeight,
  // paragraphElCurrent,
  // setParagraphElCurrent,
}) => {
  //
  // const { turn } = useTurnContext();
  const turn = useSelector((state) => state.turns.d[turnId]);
  const dispatch = useDispatch();
  const {
    width,
    paragraph: originalParagraph,
    y,
    contentType,
    compressedParagraphState,
  } = turn;
  const stage = getParagraphStage(turn);
  const stageIsCompReady = stage === COMP_READY;
  const [compressedTexts, setCompressedTexts] = useState([]);
  const [textsReadyCount, setTextsReadyCount] = useState(0);
  const [compressedTextPieces, setCompressedTextPieces] = useState([]);
  const [quoteCollection, setQuoteCollection] = useState([]);

  console.log({ widget });

  //
  const paragraph = originalParagraph.map((paragraphItem) => ({
    ...paragraphItem,
  }));
  const wrapperRef = useRef(null); // @learn null это мы, undefined, это система

  // @fixme: цитата делит одно слово на несколько слов
  // const words = paragraph
  //   .map((textItem) => textItem.insert)
  //   .join(' ')
  //   .split(' '); // слили всё в один большой текст и разделили по словам

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

  const { isDeveloperModeActive, setDevItem } = useDevPanel();

  if (isDeveloperModeActive) {
    setDevItem(
      'compressor',
      classNameId,
      {
        x: 0,
        y: widget.minTop,
        w: widget.width,
        h: widget.minHeight,
        selector: `.${classNameId}`,
      },
      'turn',
      turnId
    );
  }

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
    if (!wrapperRef.current) return false;
    if (stage !== COMP_LOADING) return false;
    if (compressedParagraphState) {
      const widgetMinHeight = compressedParagraphState.textPieces.reduce(
        (acc, textPiece) => acc + textPiece.height,
        0
      );
      const widgetMaxHeight = compressedParagraphState.textPieces.reduce(
        (acc, textPiece) => acc + textPiece.scrollHeight,
        0
      );
      registerHandleResizeWithParams({
        widgetMinHeight,
        widgetMaxHeight,
        // widgetDesiredHeight: !!paragraphIsReady ? height : 0,
        widgetDesiredHeight: 0, //stage === COMP_READY ? height : 0,
      });
    } else {
      const quotes = getParagraphQuotesWithoutScroll(turnId, wrapperRef);
      // console.log({ quotes });

      const textPieces = calculateTextPiecesFromQuotes(
        quotes,
        wrapperRef?.current
      );
      // console.log({ textPieces });
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
    }
  }, [wrapperRef, stage]); //, height, stateIsReady, paragraphIsReady]);

  useEffect(() => {
    if (compressedParagraphState) {
      textPieces = compressedParagraphState.textPieces;
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

      // console.log(
      //   'textPieces',
      //   textPieces.reduce((sum, textPiece) => {
      //     console.log(textPiece);
      //     return sum + textPiece.height;
      //   }, 0)
      // );

      setCompressedHeight(
        textPieces.reduce((sum, textPiece) => sum + textPiece.height, 0)
        // + (textPieces.length - 1) * 11 // todo: const
      );
      return;
    }

    // if (!wrapperRef.current) return false;
    if (!compressedTextPieces?.length) return false;

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
      if (span.parentNode.style.background) return false;
      if (
        !span.style.background &&
        span.parentNode.classList.contains('compressor')
      )
        return false;
      return true;
    });

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
            console.log({ span });
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

    paragraphStateSaveToLocalStorage(textPieces, turnId);

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

    // console.log(
    //   'textPieces',
    //   textPieces.reduce((sum, textPiece) => {
    //     console.log(textPiece);
    //     return sum + textPiece.height;
    //   }, 0)
    // );

    setCompressedHeight(
      textPieces.reduce((sum, textPiece) => sum + textPiece.height, 0)
      // + (textPieces.length - 1) * 11 // todo: const
    );
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
    increment('txt_compressor', { turnId, count: compressedTexts.length });

    if (!widget) return [];

    let deltaTop = 0;
    let deltaScrollHeightTop = 0;
    // const widgetTop = wrapperRef.current.getBoundingClientRect().top - turn.y;
    let newDeltaScrollHightTop = 0;

    console.log({ compressedTexts });

    return compressedTexts.map((text, i) => {
      deltaTop += text.height;
      deltaScrollHeightTop += text.scrollHeight;
      // newDeltaScrollHightTop = text.height - text.scrollHeight
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
          delta={text.delta}
          deltaScrollHeightTop={deltaScrollHeightTop - text.scrollHeight}
          scrollHeight={text.scrollHeight}
          widgetTop={widget?.minTop} // @todo: проверить widget?.minTop
          widgetWidth={widget?.width}
          quotes={text.quotes}
          // newDeltaScrollHightTop={newDeltaScrollHightTop}
        />
      );
    });
    // return compressedTexts.map((text, i) => {
    //   return (
    //     <TextAroundQuote
    //       key={i}
    //       {...{
    //         // contentType,
    //         // backgroundColor,
    //         // fontColor,
    //         // registerHandleResize,
    //         // unregisterHandleResize,
    //         // variableHeight,
    //         setTextIsReady,
    //         paragraph: text.paragraph,
    //         scrollPosition: text.scrollTop + text.delta,
    //         // scrollPosition: text.scrollTop,
    //         height: text.height, // через этот viewport смотрим на кусок текста
    //         // height: text.scrollHeight,
    //       }}
    //     />
    //   );
    // });
    // }, [compressedTexts, wrapperRef, stageIsCompReady]);
  }, [compressedTexts, widget]);

  const paragraphCompressorTextWrapper = useMemo(() => {
    return <ParagraphCompressorTextWrapper arrText={paragraph} />;
  }, []);

  return (
    <div className="wrapperParagraphText">
      <div style={{ position: 'relative' }}>
        <div
          ref={wrapperRef}
          className="compressor paragraphText"
          // style={{ width: `${width}px` }}
        >
          {/* {stage !== COMP_READY ? paragraphCompressorTextWrapper : ''} */}
          {stage !== COMP_READY && !compressedParagraphState
            ? paragraphCompressorTextWrapper
            : ''}
        </div>
      </div>
      <div className={`compressed-paragraph-widget ${classNameId}`}>
        {textsAroundQuotes}
      </div>
    </div>
  );
};

export default Compressor;

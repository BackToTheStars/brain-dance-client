import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';

import {
  useRef,
  useState,
  useEffect,
  useMemo,
  memo,
  createContext,
  useContext,
} from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getParagraphQuotesWithoutScroll } from '../../helpers/quotesHelper';
import {
  ParagraphCompressorTextWrapper,
  TextAroundQuoteOptimized,
} from './TextWrappers';
import { calculateTextPiecesFromQuotes } from './oldHelper';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import ParagraphEditButton from './EditButton';
import { TURN_SIZE_MIN_WIDTH } from '@/config/turn';

export const CompressorContext = createContext();

export const CompressorProvider = ({ children }) => {
  const [quoteCollection, setQuoteCollection] = useState([]);
  const addToQuoteCollection = (quotesInfoPart, index) => {
    setQuoteCollection((quoteCollection) => {
      // callback потому что идём через useMemo, чтобы отвязаться от scope
      const quoteCollectionCopy = [...quoteCollection];
      quoteCollectionCopy[index] = quotesInfoPart;
      return quoteCollectionCopy;
    });
  };
  return (
    <CompressorContext.Provider value={{
      quoteCollection,
      addToQuoteCollection,
    }}>
      {children}
    </CompressorContext.Provider>
  );
};

const Compressor = ({
  turnId,
  widgetId,
  // setWrapperElCurrent,
  registerHandleResize,
  unregisterHandleResize,
  widgetsUpdatedTime,
}) => {
  const pRef = useRef(null);
  const { can } = useUserContext();
  const turn = useSelector((state) => state.turns.d[turnId]);
  const width = useSelector((state) => state.turns.g[turnId].size.width);
  const [widgetTop, setWidgetTop] = useState(0); // @todo: get from turn widget geometry
  const { paragraph, contentType } = turn;
  const [compressedTextPieces, setCompressedTextPieces] = useState([]);
  const wrapperRef = useRef(null); // @learn null это мы, undefined, это система

  const classNameId = `turn_${turnId}_compressor_${widgetId}`;

  const { compressedTexts } = useMemo(() => {
    if (!compressedTextPieces?.length) return { compressedTexts: [] };
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
      0,
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
    }

    const height = textPieces.reduce(
      // высота виджета параграфа в сжатом состоянии
      (sum, textPiece) => sum + textPiece.height,
      0,
    );
    // setCompressedTexts(textPieces);
    return {
      compressedTexts: textPieces,
    };
  }, [width, compressedTextPieces]); // , wrapperRef

  const { desiredHeight, textsAroundQuotes } = useMemo(() => {
    let deltaTop = 0;
    let deltaScrollHeightTop = 0;

    const textsAroundQuotes = compressedTexts.map((text, i) => {
      deltaTop += text.height;
      deltaScrollHeightTop += text.scrollHeight;

      return (
        <TextAroundQuoteOptimized
          index={i}
          key={i}
          arrText={text.paragraph || []}
          turnId={turnId}
          turnType={contentType}
          scrollPosition={text.scrollTop} // + text.delta}
          height={text.height}
          deltaTop={deltaTop - text.height}
          deltaScrollHeightTop={deltaScrollHeightTop - text.scrollHeight}
          // widgetTop={widget?.minTop} // @todo: проверить widget?.minTop
          widgetTop={widgetTop}
          // widgetWidth={widget?.width}
          widgetWidth={width - 12}
          quotes={text.quotes}
          parentClassNameId={classNameId}
        />
      );
    });

    const desiredHeight = compressedTexts.reduce(
      (sum, text) => sum + text.height,
      0,
    );
    return { textsAroundQuotes, desiredHeight };
  }, [compressedTexts, width, widgetTop]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const quotes = getParagraphQuotesWithoutScroll(turnId, wrapperRef);
    const textPieces = calculateTextPiecesFromQuotes(
      quotes,
      wrapperRef.current,
    );
    setCompressedTextPieces(textPieces);
  }, []);

  useEffect(() => {
    if (!desiredHeight) return;
    if (!compressedTextPieces.length) return;
    if (!desiredHeight) return;
    const resizeInfo = {
      id: widgetId,
      type: 'paragraph',
      resizeDisabled: true,
      minWidthCallback: () => TURN_SIZE_MIN_WIDTH,
      minHeightCallback: () => desiredHeight, // || height,
      desiredHeightCallback: () => desiredHeight,
      getDesiredHeight: ({ newHeight }) => desiredHeight, // || height,
      maxHeightCallback: () => {
        return desiredHeight; // || paragraphEl?.current?.scrollHeight;
      },
    };
    registerHandleResize(resizeInfo);
    return () => unregisterHandleResize(widgetId);
  }, [desiredHeight, compressedTextPieces]);

  // const paragraphCompressorTextWrapper = useMemo(() => {
  //   return <ParagraphCompressorTextWrapper arrText={paragraph} />;
  // }, []);

  useEffect(() => {
    if (!pRef.current) return;
    setWidgetTop(pRef.current.offsetTop);
  }, [pRef.current, widgetsUpdatedTime]);

  return (
    <div className="wrapperParagraphText stb-widget-paragraph" ref={pRef}>
      <div
        style={{
          position: 'absolute',
          width: 'calc(100% - 18px)', // ? 8 + 8 + 6
          opacity: 0,
          zIndex: -1,
          paddingLeft: '6px',
          paddingRight: '6px',
          height: '10px',
          overflowY: 'hidden',
        }}
      >
        <div ref={wrapperRef} className="compressor paragraphText">
          {/* {!textsAroundQuotes.length && paragraphCompressorTextWrapper} */}
          {/* {paragraphCompressorTextWrapper} */}
          <ParagraphCompressorTextWrapper arrText={paragraph} />
        </div>
      </div>
      <div className={`compressed-paragraph-widget ${classNameId}`}>
        {textsAroundQuotes}
      </div>
      <QuoteCollectionController
        compressedTextsLength={compressedTexts.length}
        turnId={turnId}
        widgetId={widgetId}
      />
      {can(RULE_TURNS_CRUD) && (
        <ParagraphEditButton turnId={turnId} widgetId={widgetId} />
      )}
    </div>
  );
};

const QuoteCollectionController = memo(
  ({ turnId, widgetId, compressedTextsLength }) => {
    const { quoteCollection } = useContext(CompressorContext);
    const dispatch = useDispatch();
    useEffect(() => {
      if (!compressedTextsLength) return;
      if (!quoteCollection.length) return;
      const count = quoteCollection.filter((q) => !!q).length;
      if (count !== compressedTextsLength) return;
      const quotesInfo = quoteCollection.reduce((acc, element) => {
        return [...acc, ...element];
      }, []);
      dispatch(quoteCoordsUpdate(turnId, widgetId, quotesInfo));
    }, [quoteCollection]);
    return null;
  },
);

export default memo(Compressor);

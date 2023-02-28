import { PARAGRAPH_TEXT_PADDING, TURN_QUOTE_BORDER_RADIUS } from '@/config/ui';
import { increment } from '@/modules/telemetry/utils/logger';
import React, { useEffect, useRef, Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';

const ORANGE = '#ffd596';
const GRAY = '#d2d3d4';
const PINK = '#fdc9ff';
const LIGHT_BLUE = '#9cf5ff';
const GREEN = '#8aff24';
const YELLOW = '#ffff00';

const modifyQuoteBackgrounds = (arrText, turnType) => {
  const colorSet = {};
  colorSet.turn = {
    [ORANGE]: '#8f480d',
    [GRAY]: '#525354',
    [PINK]: '#85176d',
    [LIGHT_BLUE]: '#1f717a',
    [GREEN]: '#3f6e17',
    [YELLOW]: '#87862b',
  };
  colorSet.comment = {
    [ORANGE]: '#edb193',
    [GRAY]: '#d2d3d4',
    [PINK]: '#fdc9ff',
    [LIGHT_BLUE]: '#9cf5ff',
    [GREEN]: '#8aff24',
    [YELLOW]: '#ffff00',
  };

  const colors = colorSet?.[turnType] || colorSet.turn;

  return arrText.map((textItem) => {
    if (!textItem?.attributes?.background) return textItem;
    // console.log(textItem?.attributes?.background);
    return {
      ...textItem,
      attributes: {
        ...textItem.attributes,
        background:
          colors[textItem.attributes.background] ||
          textItem.attributes.background,
        borderRadius: TURN_QUOTE_BORDER_RADIUS,
      },
    };
  });
};

export const ParagraphOriginalTexts = ({
  arrText,
  turnId,
  turnType,
  compressed = false,
  // setTextIsReady = () => {},
  // scrollPosition = -1, // специально ненастоящее значение, чтобы проверять
}) => {
  //
  const modifiedArrText = modifyQuoteBackgrounds(arrText, turnType);

  return (
    <>
      {modifiedArrText.map((textItem, i) => {
        const arrInserts = textItem.insert ? textItem.insert.split('\n') : [];
        const newInserts = [];
        for (let j = 0; j < arrInserts.length; j++) {
          newInserts.push(arrInserts[j]);
          newInserts.push(<br key={j} />);
        }
        newInserts.pop();
        return (
          <OriginalSpanTextPiece
            key={i}
            {...{
              textItem,
              newInserts,
              turnId,
              compressed,
            }}
          />
        );
      })}
    </>
  );
};

// export const ParagraphOriginalTextWrapper = React.memo(ParagraphOriginalTexts);

export const OriginalSpanTextPiece = ({ textItem, newInserts, compressed }) => {
  // const spanFragment = useRef(null);
  const isItQuote = textItem.attributes
    ? !!textItem.attributes.background
    : false;

  return (
    <span
      style={textItem.attributes}
      data-id={isItQuote ? textItem.attributes.id : ''}
      className={isItQuote && compressed ? 'compressed-quote' : ''}
      // ref={spanFragment}
    >
      {newInserts}
    </span>
  );
};

export const ParagraphCompressorTextWrapper = ({ arrText }) => {
  // if (!arrText) return;
  // console.log({ arrText });
  const modifiedArrText = arrText && modifyQuoteBackgrounds(arrText, 'turn');
  // console.log('ParagraphCompressorTextWrapper', arrText.length);
  // return 'check';
  return (
    <>
      {(modifiedArrText || []).map((textItem, i) => {
        // @todo: refactoring
        const arrInserts = textItem.insert ? textItem.insert.split('\n') : [];
        const newInserts = [];
        for (let j = 0; j < arrInserts.length; j++) {
          newInserts.push(arrInserts[j]);
          newInserts.push(<br key={j} />);
        }
        newInserts.pop();
        return (
          <CompressorSpanTextPiece
            key={i}
            {...{
              textItem,
              newInserts,
            }}
          />
        );
      })}
    </>
  );
};

export const CompressorSpanTextPiece = ({ textItem, newInserts }) => {
  const isTextQuote =
    !!textItem && textItem.attributes && textItem.attributes.background;
  const additionalAttributes = {};
  if (isTextQuote && textItem.attributes?.id) {
    additionalAttributes['data-id'] = textItem.attributes.id;
  }
  return (
    <span
      style={textItem.attributes}
      className={isTextQuote ? 'compressed-quote' : ''}
      {...additionalAttributes}
    >
      {newInserts.map((item, index) => {
        if (typeof item === 'string') {
          if (item.includes(' ')) {
            const words = item.split(' ');
            return (
              <Fragment key={'item' + index}>
                {words.map((word, index2) => {
                  increment('WordMap');
                  return (
                    <span key={`item-${index}-${index2}`}>
                      {word}
                      {index2 < words.length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
              </Fragment>
            );
          } else {
            return <span key={'item' + index}>{item}</span>;
          }
        }
        return item;
      })}
    </span>
  );
};

export const TextAroundQuote = ({
  // contentType,
  // backgroundColor,
  // fontColor,
  // registerHandleResize,
  // unregisterHandleResize,
  // variableHeight,

  paragraph,
  scrollPosition,
  height, // через этот viewport смотрим на кусок текста
  setTextIsReady,
}) => {
  //
  const paragraphEl = useRef(null);

  useEffect(() => {
    // @todo: check if no quotes
    paragraphEl.current.scrollTop = scrollPosition;
    setTimeout(() => {
      // console.log(`${!paragraph?.current}, []`);
      increment('txt_textAroundQuote');
      if (!paragraphEl?.current) return;
      paragraphEl.current.scrollTop = scrollPosition;
      const quotes = [
        ...paragraphEl.current.querySelectorAll('.compressed-quote'),
      ];
      if (!quotes?.length) {
        console.log('no quotes in TextAroundQuote');
        return;
      }

      const { top } = quotes[0].getBoundingClientRect();
      const { bottom } = quotes[quotes.length - 1].getBoundingClientRect();
      const middleLine = (top + bottom) / 2;
      const { top: paragraphTop, bottom: paragraphBottom } =
        paragraphEl.current.getBoundingClientRect();
      const middleLineParagraph = (paragraphTop + paragraphBottom) / 2;
      const fixScroll = Math.floor(middleLineParagraph - middleLine);
      paragraphEl.current.scrollTop -= fixScroll;
      setTextIsReady();
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
      <ParagraphCompressorTextWrapper {...{ arrText: paragraph }} />
    </div>
  );
};

export const TextAroundQuoteOptimized = ({
  scrollPosition,
  height, // через этот viewport смотрим на кусок текста
  setTextIsReady,
  arrText,
  turnId,
  turnType,
  index,
  addToQuoteCollection,
  deltaTop,
  widgetTop,
  widgetWidth,
  quotes,
}) => {
  //
  const paragraphEl = useRef(null);

  const [scrollTop, setScrollTop] = useState(scrollPosition);
  const [quotesInfoPart, setQuotesInfoPart] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    // @todo: check if no quotes
    // paragraphEl.current.scrollTop = scrollPosition;
    // setTimeout(() => {
    // if (!paragraphEl?.current) return;
    // paragraphEl.current.scrollTop = scrollPosition;
    // const quotes = [
    //   ...paragraphEl.current.querySelectorAll('.compressed-quote'),
    // ];
    if (!quotes?.length) {
      console.log('no quotes in TextAroundQuote');
      return;
    }

    const { top } = quotes[0].top;
    const lastQuote = quotes.at(-1);
    const { bottom } = lastQuote.top + lastQuote.height;
    const middleLine = (top + bottom) / 2;
    const paragraphTop = widgetTop + deltaTop; // + turn.y?
    const paragraphBottom = paragraphTop + height;
    const middleLineParagraph = (paragraphTop + paragraphBottom) / 2;
    const fixScroll = Math.floor(middleLineParagraph - middleLine);
    paragraphEl.current.scrollTop -= fixScroll;
    // for (let quote of quotes) {
    // const { top, bottom } = quote.getBoundingClientRect();
    // }
    // console.log(middleLine, ' ', middleLineParagraph);

    const quotesInfoPart = [];

    for (let quote of quotes) {
      const { top, left, width, height } = quote;
      quotesInfoPart.push({
        initialCoords: {
          left: PARAGRAPH_TEXT_PADDING,
          top: top + paragraphEl.current.scrollTop,
          width,
          height,
        },
        quoteId: quote.quoteId,
        quoteKey: quote.quoteKey,
        turnId,
        text: quote.text,
        type: 'text',
        width,
        height,
        left: PARAGRAPH_TEXT_PADDING,
        // top: deltaTop + top,
        top: top + paragraphEl.current.scrollTop,
        // position: 'bottom',
      });
    }
    setQuotesInfoPart(quotesInfoPart);
    // dispatch(quoteCoordsUpdate(turnId,'text', quotesInfoPart));

    setTextIsReady();
    //
    // }, 300);
  }, []);

  useEffect(() => {
    if (!quotesInfoPart.length) return;
    const blockTop = widgetTop + deltaTop;
    const blockBottom = widgetTop + deltaTop + height;
    addToQuoteCollection(
      quotesInfoPart.map((quoteInfo) => {
        const quoteTop = quoteInfo.top - scrollTop;
        const quoteBottom = quoteInfo.top + quoteInfo.height - scrollTop;

        const params = {};

        if (quoteBottom < blockTop) {
          params.height = 0;
          params.top = blockTop + 1;
        } else if (quoteTop < blockTop) {
          params.top = blockTop + 1;
          params.height = quoteBottom - blockTop;
        } else if (quoteTop > blockBottom) {
          params.top = blockBottom - 1;
          params.height = 0;
        } else if (quoteBottom > blockBottom) {
          params.height = blockBottom - quoteTop;
        } else {
          params.top = quoteInfo.initialCoords.top - scrollTop;
        }

        return {
          ...quoteInfo,
          ...params,
        };
      }),
      index
    );
  }, [scrollTop, quotesInfoPart]);

  useEffect(() => {
    if (!paragraphEl || !paragraphEl.current) return;
    const scrollHandler = () => {
      if (!!paragraphEl.current) {
        setScrollTop(paragraphEl.current.scrollTop);
      }
    };
    paragraphEl.current.addEventListener('scroll', scrollHandler);
    return () =>
      paragraphEl.current?.removeEventListener('scroll', scrollHandler);
  }, [paragraphEl]);

  return (
    <div
      className="paragraphText"
      ref={paragraphEl}
      style={{ height: `${height}px` }}
    >
      <ParagraphOriginalTexts
        {...{ arrText, turnId, turnType, compressed: true }}
      />
    </div>
  );
};

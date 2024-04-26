import {
  TURN_QUOTE_BORDER_RADIUS,
  TURN_SCROLLBAR_MARGIN,
  widgetSpacer,
} from '@/config/ui';
import React, { useEffect, useRef, Fragment, useState, useMemo } from 'react';

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
    const rectColor =
      colors[textItem.attributes.background] || textItem.attributes.background;
    return {
      ...textItem,
      attributes: {
        ...textItem.attributes,
        background: rectColor,
        borderRadius: TURN_QUOTE_BORDER_RADIUS,
        outline: `solid 2px ${rectColor}`,
      },
    };
  });
};

export const ParagraphOriginalTexts = ({
  arrText,
  turnId,
  turnType,
  compressed = false,
}) => {
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

export const OriginalSpanTextPiece = ({ textItem, newInserts, compressed }) => {
  // const spanFragment = useRef(null);
  const isItQuote = textItem.attributes
    ? !!textItem.attributes.background
    : false;

  // console.log(newInserts);

  const links = isItQuote
    ? newInserts
    : newInserts.map((element, index) => {
        if (typeof element !== 'string') return element;
        const iterator = element.matchAll(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gm,
          '<a href="$&" target="_blank">$&</a>'
        );
        const matches = [];
        for (const item of iterator) {
          matches.push(item);
        }
        if (matches.length === 0) return element;
        const items = [];
        let startPosition = 0;
        for (const match of matches) {
          if (match.index > startPosition)
            items.push({
              value: element.slice(startPosition, match.index),
              type: 'text',
            });
          const value =
            match[0].at(-1) === '.' ? match[0].slice(0, -1) : match[0];
          items.push({ value, type: 'link' });
          startPosition = match.index + value.length;
        }
        if (startPosition < element.length) {
          items.push({ value: element.slice(startPosition), type: 'text' });
        }
        return items.map((item, index2) => {
          if (item.type === 'text') return item.value;
          return (
            <a key={`${index}_${index2}`} href={item.value} target="_blank">
              {item.value}
            </a>
          );
        });
      });

  return (
    <span
      style={textItem.attributes}
      data-id={isItQuote ? textItem.attributes.id : ''}
      className={isItQuote && compressed ? 'compressed-quote' : ''}
      // ref={spanFragment}
    >
      {links}
    </span>
  );
};

export const ParagraphCompressorTextWrapper = ({ arrText }) => {
  const modifiedArrText = arrText && modifyQuoteBackgrounds(arrText, 'turn');
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

/** @deprecated */
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
  deltaScrollHeightTop,
  widgetTop,
  widgetWidth,
  quotes,
  parentClassNameId,
}) => {
  //
  const paragraphEl = useRef(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [quotesInfoPart, setQuotesInfoPart] = useState([]);

  const classNameId = `${parentClassNameId}_textaroundquotes_${index}`;

  useEffect(() => {
    // @todo: check if no quotes
    if (!paragraphEl?.current) return;
    paragraphEl.current.scrollTop = scrollPosition;
    if (!quotes?.length) {
      console.log('no quotes in TextAroundQuote');
      return;
    }

    const quotesInfoPart = [];

    for (let quote of quotes) {
      const { top, left, width, height } = quote;
      quotesInfoPart.push({
        initialCoords: {
          left: left,
          top: top + widgetTop + deltaTop - deltaScrollHeightTop + widgetSpacer,
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
        left: left,
        top: top,
      });
    }

    setQuotesInfoPart(quotesInfoPart);
    setTextIsReady();
  }, [paragraphEl]);

  useEffect(() => {
    if (!quotesInfoPart.length) return;
    const blockTop = widgetTop + deltaTop + widgetSpacer;
    const blockBottom = widgetTop + deltaTop + height + widgetSpacer;

    addToQuoteCollection(
      quotesInfoPart.map((quoteInfo) => {
        const quoteTop = quoteInfo.initialCoords.top - scrollTop;
        const quoteBottom =
          quoteInfo.initialCoords.top +
          quoteInfo.initialCoords.height -
          scrollTop;

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
          params.top = quoteTop;
          params.height = blockBottom - quoteTop;
        } else {
          params.top = quoteTop;
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
      className={`paragraphText ${classNameId}`}
      ref={paragraphEl}
      style={{ height: `${height}px` }}
    >
      <ParagraphOriginalTexts
        {...{ arrText, turnId, turnType, compressed: true }}
      />
    </div>
  );
};

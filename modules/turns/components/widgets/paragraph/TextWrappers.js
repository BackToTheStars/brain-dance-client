import {
  TURN_QUOTE_BORDER_RADIUS,
  TURN_SCROLLBAR_MARGIN,
  widgetSpacer,
} from '@/config/ui';
import React, {
  useEffect,
  useRef,
  Fragment,
  useState,
  useMemo,
  useContext,
} from 'react';
import { colorSet, getNeedBlackText } from '../../helpers/color';
import { CompressorContext } from './Compressor';

const modifyQuoteBackgrounds = (arrText, turnType) => {
  const colors = colorSet?.[turnType] || colorSet.turn;

  return arrText.map((textItem) => {
    if (!textItem?.attributes?.background) return textItem;
    // console.log(textItem?.attributes?.background);
    const rectColor =
      colors[textItem.attributes.background] || textItem.attributes.background;
    const attributes = {
      ...textItem.attributes,
      background: rectColor,
      borderRadius: TURN_QUOTE_BORDER_RADIUS,
      outline: `solid 2px ${rectColor}`,
    };

    attributes.color = getNeedBlackText(rectColor) ? '#000' : '#fff';

    return {
      ...textItem,
      attributes,
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

export const ParagraphCompressorTextWrapper = ({ arrText = [] }) => {
  // const modifiedArrText = arrText && modifyQuoteBackgrounds(arrText, 'turn');
  const [processed, setProcessed] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setProcessed(true);
    }, 1000);
  }, []);
  return (
    <>
      {!processed &&
        arrText.map((textItem, i) => {
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

export const TextAroundQuoteOptimized = ({
  scrollPosition,
  height, // через этот viewport смотрим на кусок текста
  arrText,
  turnId,
  turnType,
  index,
  deltaTop,
  deltaScrollHeightTop,
  widgetTop,
  // widgetWidth,
  quotes,
  parentClassNameId,
}) => {
  const { addToQuoteCollection } = useContext(CompressorContext);
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
          // @todo: get from size settings
          left: left + 8 - 1,
          top: top + widgetTop + deltaTop - deltaScrollHeightTop - 1, // + widgetSpacer,
          width: width + 1,
          height: height + 1,
        },
        quoteId: quote.quoteId,
        quoteKey: quote.quoteKey,
        turnId,
        text: quote.text,
        type: 'text',
        width: width + 1,
        height: height + 1,
        left: left + 8 - 1,
        top: top - 1,
      });
    }

    setQuotesInfoPart(quotesInfoPart);
  }, [paragraphEl, widgetTop]);

  useEffect(() => {
    if (!quotesInfoPart.length) return;
    const blockTop = widgetTop + deltaTop; // + widgetSpacer;
    const blockBottom = widgetTop + deltaTop + height; // + widgetSpacer;

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
      className={`stb-widget-paragraph paragraphText ${classNameId}`}
      ref={paragraphEl}
      style={{ height: `${height}px` }}
    >
      <ParagraphOriginalTexts
        {...{ arrText, turnId, turnType, compressed: true }}
      />
    </div>
  );
};

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

/** Утилита для разбиения строки по переводу строки с добавлением <br /> */
const getInserts = (text) => {
  if (!text) return [];
  const parts = text.split('\n');
  return parts.flatMap((line, idx) =>
    idx === parts.length - 1 ? [line] : [line, <br key={idx} />],
  );
};

/** Преобразует строку, содержащую URL, в массив React-элементов с ссылками
 * Использует keyPrefix для уникальности ключей
 */
const processTextForLinks = (text, keyPrefix) => {
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;
  const parts = [];
  let lastIndex = 0;
  const matches = [...text.matchAll(urlRegex)];
  if (matches.length === 0) return text;
  matches.forEach((match, idx) => {
    const { index } = match;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    let url = match[0];
    if (url.endsWith('.')) {
      url = url.slice(0, -1);
    }
    parts.push(
      <a key={`${keyPrefix}-${idx}`} href={url} target="_blank">
        {url}
      </a>,
    );
    lastIndex = index + match[0].length;
  });
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

/** Модифицирует атрибуты элементов для цитат */
const modifyQuoteBackgrounds = (arrText, turnType) => {
  const colors = colorSet?.[turnType] || colorSet.turn;
  return arrText.map((textItem) => {
    if (!textItem?.attributes?.background) return textItem;
    const rectColor =
      colors[textItem.attributes.background] || textItem.attributes.background;
    const attributes = {
      ...textItem.attributes,
      background: rectColor,
      borderRadius: TURN_QUOTE_BORDER_RADIUS,
      outline: `solid 2px ${rectColor}`,
    };
    attributes.color = getNeedBlackText(rectColor) ? '#000' : '#fff';
    return { ...textItem, attributes };
  });
};

/** Рендерит слова с уникальными ключами, используя префикс */
const renderText = (text, prefix = '') =>
  text.split(' ').map((word, idx, arr) => (
    <span key={`${prefix}-${idx}`}>
      {word}
      {idx < arr.length - 1 ? ' ' : ''}
    </span>
  ));

/** Компонент для полного отображения текста с разметкой */
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
        const newInserts = getInserts(textItem.insert);
        return (
          <OriginalSpanTextPiece
            key={i}
            textItem={textItem}
            newInserts={newInserts}
            turnId={turnId}
            compressed={compressed}
          />
        );
      })}
    </>
  );
};

/** Рендерит отдельный фрагмент текста с обработкой ссылок */
export const OriginalSpanTextPiece = ({ textItem, newInserts, compressed }) => {
  const isItQuote = !!(textItem.attributes && textItem.attributes.background);
  let content;
  if (!isItQuote && textItem?.attributes?.link) {
    content = (
      <a href={textItem.attributes.link} target="_blank">
        {textItem.insert}
      </a>
    );
  } else {
    content = newInserts.map((element, outerIndex) => {
      if (typeof element !== 'string') return element;
      return (
        <Fragment key={'fragment_' + outerIndex}>
          {processTextForLinks(element, outerIndex)}
        </Fragment>
      );
    });
  }
  return (
    <span
      style={textItem.attributes}
      data-id={isItQuote ? textItem.attributes.id : ''}
      className={isItQuote && compressed ? 'compressed-quote' : ''}
    >
      {content}
    </span>
  );
};

/** Компонент для первичного отображения текста в режиме Compressor */
export const ParagraphCompressorTextWrapper = ({ arrText = [] }) => {
  const [processed, setProcessed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setProcessed(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {!processed &&
        arrText.map((textItem, i) => {
          const newInserts = getInserts(textItem.insert);
          return (
            <CompressorSpanTextPiece
              key={i}
              textItem={textItem}
              newInserts={newInserts}
            />
          );
        })}
    </>
  );
};

/** Рендерит отдельный фрагмент сжатого текста, разбивая строки на слова */
export const CompressorSpanTextPiece = ({ textItem, newInserts }) => {
  const isTextQuote = !!(
    textItem?.attributes && textItem.attributes.background
  );
  const additionalAttributes =
    isTextQuote && textItem.attributes?.id
      ? { 'data-id': textItem.attributes.id }
      : {};
  return (
    <span
      style={textItem.attributes}
      className={isTextQuote ? 'compressed-quote' : ''}
      {...additionalAttributes}
    >
      {newInserts.map((item, outerIndex) =>
        typeof item === 'string' ? (
          <Fragment key={'fragment_' + outerIndex}>
            {renderText(item, outerIndex)}
          </Fragment>
        ) : (
          item
        ),
      )}
    </span>
  );
};

/** Компонент для отображения текста вокруг цитат в режиме Compressor */
export const TextAroundQuoteOptimized = ({
  scrollPosition,
  height, // высота viewport-а
  arrText,
  turnId,
  turnType,
  index,
  deltaTop,
  deltaScrollHeightTop,
  widgetTop,
  quotes,
  parentClassNameId,
}) => {
  const { addToQuoteCollection } = useContext(CompressorContext);
  const paragraphEl = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [quotesInfoPart, setQuotesInfoPart] = useState([]);

  const classNameId = `${parentClassNameId}_textaroundquotes_${index}`;

  useEffect(() => {
    if (!paragraphEl.current) return;
    paragraphEl.current.scrollTop = scrollPosition;
    if (!quotes || !quotes.length) {
      console.log('no quotes in TextAroundQuote');
      return;
    }
    const computedQuotes = quotes.map((quote) => {
      const computedLeft = quote.left + 7; // эквивалентно (left + 8 - 1)
      const computedWidth = quote.width + 1;
      const computedHeight = quote.height + 1;
      return {
        initialCoords: {
          left: computedLeft,
          top: quote.top + widgetTop + deltaTop - deltaScrollHeightTop - 1,
          width: computedWidth,
          height: computedHeight,
        },
        quoteId: quote.quoteId,
        quoteKey: quote.quoteKey,
        turnId,
        text: quote.text,
        type: 'text',
        width: computedWidth,
        height: computedHeight,
        left: computedLeft,
        top: quote.top - 1,
      };
    });
    setQuotesInfoPart(computedQuotes);
  }, [scrollPosition, quotes, widgetTop, deltaTop, deltaScrollHeightTop]);

  useEffect(() => {
    if (!quotesInfoPart.length) return;
    const blockTop = widgetTop + deltaTop;
    const blockBottom = blockTop + height;
    const updatedQuotes = quotesInfoPart.map((quoteInfo) => {
      const { initialCoords } = quoteInfo;
      const quoteTop = initialCoords.top - scrollTop;
      const quoteBottom = initialCoords.top + initialCoords.height - scrollTop;
      let params = {};
      if (quoteBottom < blockTop) {
        params = { height: 0, top: blockTop + 1 };
      } else if (quoteTop < blockTop) {
        params = { top: blockTop + 1, height: quoteBottom - blockTop };
      } else if (quoteTop > blockBottom) {
        params = { top: blockBottom - 1, height: 0 };
      } else if (quoteBottom > blockBottom) {
        params = { top: quoteTop, height: blockBottom - quoteTop };
      } else {
        params = { top: quoteTop };
      }
      return { ...quoteInfo, ...params };
    });
    addToQuoteCollection(updatedQuotes, index);
  }, [
    scrollTop,
    quotesInfoPart,
    widgetTop,
    deltaTop,
    height,
    addToQuoteCollection,
    index,
  ]);

  useEffect(() => {
    if (!paragraphEl.current) return;
    const scrollHandler = () => setScrollTop(paragraphEl.current.scrollTop);
    const el = paragraphEl.current;
    el.addEventListener('scroll', scrollHandler);
    return () => el.removeEventListener('scroll', scrollHandler);
  }, []);

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

import React, { useEffect, useRef, Fragment } from 'react';

const modifyQuoteBackgrounds = (arrText) => {
  const colors = {
    '#ffd596': '#9855c2', // оранжевый - фиолетовый
    '#d2d3d4': '#0a19a8', // серый - синий
    '#fdc9ff': '#8a0c14', // розовый - красный
    '#9cf5ff': '#0d7394', // голубой - голубой
    '#8aff24': '#177807', // зелёный - зелёный
    '#ffff00': '#5c5425', // жёлтый - жёлтый
    // '': '', синий - синий
    // оранжевый - оранжевый
  };
  return arrText.map((textItem, i) => {
    if (!textItem?.attributes?.background) return textItem;
    // console.log(textItem?.attributes?.background);
    return {
      ...textItem,
      attributes: {
        ...textItem.attributes,
        background:
          colors[textItem.attributes.background] ||
          textItem.attributes.background,
      },
    };
  });
};

const ParagraphOriginalTexts = ({ arrText, turnId }) => {
  const modifiedArrText = modifyQuoteBackgrounds(arrText);

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
            }}
          />
        );
      })}
    </>
  );
};

export const ParagraphOriginalTextWrapper = React.memo(ParagraphOriginalTexts);

export const OriginalSpanTextPiece = ({ textItem, newInserts }) => {
  // const spanFragment = useRef(null);
  const isItQuote = textItem.attributes
    ? !!textItem.attributes.background
    : false;

  return (
    <span
      style={textItem.attributes}
      data-id={isItQuote ? textItem.attributes.id : ''}
      // ref={spanFragment}
    >
      {newInserts}
    </span>
  );
};

export const ParagraphCompressorTextWrapper = ({ arrText }) => {
  // console.log({ arrText });
  return (
    <>
      {(arrText || []).map((textItem, i) => {
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
  return (
    <span
      style={textItem.attributes}
      className={
        !!textItem && textItem.attributes && textItem.attributes.background
          ? 'compressed-quote'
          : ''
      }
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
}) => {
  //
  const paragraphEl = useRef(null);

  useEffect(() => {
    paragraphEl.current.scrollTop = scrollPosition;
    setTimeout(() => {
      paragraphEl.current.scrollTop = scrollPosition;
      const quotes = [
        ...paragraphEl.current.querySelectorAll('.compressed-quote'),
      ];

      const { top } = quotes[0].getBoundingClientRect();
      const { bottom } = quotes[quotes.length - 1].getBoundingClientRect();
      const middleLine = (top + bottom) / 2;
      const { top: paragraphTop, bottom: paragraphBottom } =
        paragraphEl.current.getBoundingClientRect();
      const middleLineParagraph = (paragraphTop + paragraphBottom) / 2;
      const fixScroll = Math.floor(middleLineParagraph - middleLine);
      paragraphEl.current.scrollTop -= fixScroll;
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

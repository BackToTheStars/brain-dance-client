import { useEffect, useRef } from 'react';

let incId = Math.floor(new Date().getTime() / 1000);

export const getParagraphText = (arrText, setQuotes) => {
  return (
    <>
      {arrText.map((textItem, i) => {
        // @todo: refactoring
        const arrInserts = textItem.insert ? textItem.insert.split('\n') : [];
        const newInserts = [];
        for (let arrInsert of arrInserts) {
          newInserts.push(arrInsert);
          newInserts.push(<br />);
        }
        newInserts.pop();
        return <SpanTextPiece {...{ textItem, newInserts, setQuotes }} />;
      })}
    </>
  );
};

export const SpanTextPiece = ({ textItem, newInserts, setQuotes }) => {
  const spanFragment = useRef(null);
  const isItQuote = textItem.attributes
    ? !!textItem.attributes.background
    : false;

  useEffect(() => {
    if (!isItQuote) {
      return;
    }

    setQuotes((quotes) => {
      const rect = spanFragment.current.getBoundingClientRect();
      const turnEl =
        spanFragment.current.parentElement.parentElement.parentElement;
      const left = rect.left - turnEl.offsetLeft;
      const top = rect.top - turnEl.offsetTop;

      return [
        ...quotes,
        {
          id: textItem.attributes.id || new Date().getTime(),
          // id: 'quote-' + (textItem.attributes.id || (incId += 1)),
          width: rect.width,
          height: rect.height,
          left,
          top,
        },
      ];
    });
    // console.log(spanFragment.current.getBoundingClientRect());
    // console.log({ newInserts });
  }, []);

  return (
    <span
      style={textItem.attributes}
      onClick={() => {
        if (isItQuote && textItem.attributes.id) {
          alert(`Мой id: ${textItem.attributes.id}`);
        }
        console.log(isItQuote);
      }}
      ref={spanFragment}
    >
      {newInserts}
    </span>
  );
};

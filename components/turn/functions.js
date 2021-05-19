import { useEffect, useRef } from 'react';

export const getParagraphText = (arrText) => {
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
        return <SpanTextPiece {...{ textItem, newInserts }} />;
      })}
    </>
  );
};

export const SpanTextPiece = ({ textItem, newInserts }) => {
  const spanFragment = useRef(null);
  const isItQuote = textItem.attributes
    ? !!textItem.attributes.background
    : false;

  useEffect(() => {
    if (!isItQuote) {
      return;
    }
    console.log(spanFragment.current.getBoundingClientRect());
    console.log({ newInserts });
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

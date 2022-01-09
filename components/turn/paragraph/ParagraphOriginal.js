import { useRef } from 'react';
import { useTurnContext } from '../../contexts/TurnContext';

const ParagraphOriginal = ({
  topQuotesCount,
  bottomQuotesCount,
  updateSizeTime,
  setQuotesWithCoords,
  variableHeight,
}) => {
  //
  const { turn } = useTurnContext();
  const {
    paragraph,
    _id: turnId,
    backgroundColor,
    fontColor,
    contentType,
  } = turn;

  const paragraphEl = useRef(null);

  const style = {};

  if (contentType === 'comment') {
    style.backgroundColor = backgroundColor;
    style.color = fontColor || 'black';
  }
  if (!!variableHeight) {
    style.height = `${variableHeight}px`;
  }

  return (
    <p className="paragraphText original-text" ref={paragraphEl} style={style}>
      {!!topQuotesCount && (
        <span className="top-quotes-counter">{topQuotesCount}</span>
      )}
      <ParagraphTextWrapper
        arrText={paragraph || []}
        updateSizeTime={updateSizeTime}
        setQuotes={setQuotesWithCoords}
        turnId={turnId}
      />
      {!!bottomQuotesCount && (
        <span className="bottom-quotes-counter">{bottomQuotesCount}</span>
      )}
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          makeWidgetActive();
        }}
      >
        <i className="fas fa-highlighter"></i>
      </a>
    </p>
  );
};

export default ParagraphOriginal;

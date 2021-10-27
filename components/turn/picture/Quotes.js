import { quoteRectangleThickness } from '../../сonst';
import { ACTION_QUOTE_CLICKED } from '../../contexts/TurnContext';

const PictureQuotes = ({ turnId, quotes, dispatch, activeQuote, lineEnds }) => {
  //
  const onQuoteClick = (quoteId) => {
    dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId, quoteId } });
  };

  return (
    <div>
      {quotes.map((quote) => {
        //
        let bordered = !!lineEnds[`${turnId}_${quote.id}`]; // проверка нужно показывать рамку или нет
        // if (quote.id === 1635222146) {
        //   debugger;
        // }
        // let bordered = false;
        let outline = `${quoteRectangleThickness}px solid grey`;
        if (
          activeQuote &&
          activeQuote.turnId === turnId &&
          activeQuote.quoteId === quote.id
        ) {
          bordered = true;
        }
        if (bordered) {
          outline = `${quoteRectangleThickness}px solid red`;
          // if (quote.position === 'top' || quote.position === 'bottom') {
          //   outline = `${quoteRectangleThickness}px solid red`;
          // }
        }

        return (
          <div
            className="quote-rectangle"
            key={quote.id}
            style={{
              left: `${quote.x}%`,
              top: `${quote.y}%`,
              height: `${quote.height}%`,
              width: `${quote.width}%`,
              outline,
            }}
            onClick={() => onQuoteClick(quote.id)}
          />
        );
      })}
    </div>
  );
};

export default PictureQuotes;

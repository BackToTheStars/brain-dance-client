import { quoteRectangleThickness } from '../../const';
import { ACTION_QUOTE_CLICKED } from '../../contexts/TurnsCollectionContext';
import {
  MODE_GAME,
  MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
  PANEL_LINES,
  useInteractionContext,
} from '../../contexts/InteractionContext';

const PictureQuotes = ({
  turnId,
  quotes,
  dispatch,
  activeQuote,
  lineEnds,
  setInteractionMode,
}) => {
  const { bottomPanelSettings } = useInteractionContext();
  const { setPanelType } = bottomPanelSettings;
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
        const isQuoteActive =
          activeQuote &&
          activeQuote.turnId === turnId &&
          activeQuote.quoteId === quote.id;
        let outline = `${quoteRectangleThickness}px solid grey`;
        if (isQuoteActive) {
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
            onClick={() => {
              onQuoteClick(quote.id);
              if (isQuoteActive) {
                setInteractionMode(MODE_GAME);
                setPanelType(null);
              } else {
                setInteractionMode(MODE_WIDGET_PICTURE_QUOTE_ACTIVE);
                setPanelType(PANEL_LINES);
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default PictureQuotes;
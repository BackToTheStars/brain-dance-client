import { quoteRectangleThickness } from "@/config/ui";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const ParagraphQuotes = ({ paragraphQuotes }) => {
  const lineEnds = {}
  const activeQuote = null;
  const lines = useSelector((store) => store.lines.lines)
  const activeQuotesDictionary = useMemo(() => {
    const d = {}
    for (let paragraphQuote of paragraphQuotes) {
      d[paragraphQuote._id] = false;
      if (lines.find(line => {
        if (line.sourceTurnId == paragraphQuote.turnId) {
          if (line.sourceMarker == paragraphQuote.quoteId) {
            return true;
          }
        } else if (line.targetTurnId == paragraphQuote.turnId) {
          if (line.targetMarker == paragraphQuote.quoteId) {
            return true;
          }
        }
        return false
      })) {
        d[paragraphQuote.quoteId] = true;
      }
    }
    return d
  }, [paragraphQuotes, lines])
  return (
    <>
      {paragraphQuotes.map((quote, i) => {
        // все цитаты
        let bordered = !!activeQuotesDictionary[quote.quoteId]; //!!lineEnds[`${quote.turnId}_${quote.quoteId}`]; // проверка нужно показывать рамку или нет
        let outline = '0px solid transparent';
        if (
          activeQuote &&
          activeQuote.turnId === turnId &&
          activeQuote.quoteId === quote.quoteId
        ) {
          bordered = true;
        }
        if (bordered) {
          outline = `${quoteRectangleThickness}px solid red`;
          if (quote.position === 'top' || quote.position === 'bottom') {
            outline = `${quoteRectangleThickness}px solid red`;
          }
        }

        return (
          <div
            className="quote-rectangle"
            key={quote.quoteKey}
            style={{
              ...quote,
              outline,
            }}
            onClick={() => {
              onQuoteClick(quote.quoteId);
              const isQuoteActive =
                activeQuote &&
                activeQuote.turnId === turnId &&
                activeQuote.quoteId === quote.quoteId;
              if (isQuoteActive) {
                setInteractionMode(MODE_GAME);
                setPanelType(null);
              } else {
                // setInteractionMode(MODE_WIDGET_TEXT_QUOTE_ACTIVE); // @todo
                if (
                  lineEnds[`${quote.turnId}_${quote.quoteId}`]
                  // && !!activeQuote
                ) {
                  setPanelType(PANEL_LINES);
                }
              }
            }}
          ></div>
        );
      })}
    </>
  );
};

export default ParagraphQuotes;

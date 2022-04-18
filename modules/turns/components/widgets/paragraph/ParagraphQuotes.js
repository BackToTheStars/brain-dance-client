import { quoteRectangleThickness } from '@/config/ui';
import {
  filterLinesByQuoteKey,
  findLineByQuoteKey,
} from '@/modules/lines/components/helpers/line';
import { lineCreate } from '@/modules/lines/redux/actions';
import { createLinesRequest } from '@/modules/lines/requests';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ParagraphQuotes = ({ paragraphQuotes, turnId }) => {
  //
  const dispatch = useDispatch();

  const lineEnds = {};
  const activeQuote = null;
  const lines = useSelector((store) => store.lines.lines);
  const activeQuoteKey = useSelector((store) => store.quotes.activeQuoteKey);

  const onQuoteClick = () => {}; // @todo
  const setInteractionMode = () => {}; // @todo
  const setPanelType = () => {}; // @todo

  const activeQuotesDictionary = useMemo(() => {
    const d = {};
    for (let paragraphQuote of paragraphQuotes) {
      d[paragraphQuote._id] = false;
      if (
        findLineByQuoteKey(
          lines,
          `${paragraphQuote.turnId}_${paragraphQuote.quoteId}`
        )
      ) {
        d[paragraphQuote.quoteId] = true;
      }
    }
    return d;
  }, [paragraphQuotes, lines]);
  return (
    <>
      {paragraphQuotes.map((quote, i) => {
        // все цитаты
        let bordered = !!activeQuotesDictionary[quote.quoteId]; //!!lineEnds[`${quote.turnId}_${quote.quoteId}`]; // проверка нужно показывать рамку или нет
        let outline = '0px solid transparent';

        const currentQuoteKey = `${turnId}_${quote.quoteId}`;

        if (
          currentQuoteKey === activeQuoteKey
          // activeQuote &&
          // activeQuote.turnId === turnId &&
          // activeQuote.quoteId === quote.quoteId
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
              console.log(quote);
              onQuoteClick(quote.quoteId);

              // const isQuoteActive =
              //   activeQuote &&
              //   activeQuote.turnId === turnId &&
              //   activeQuote.quoteId === quote.quoteId;
              if (activeQuoteKey === currentQuoteKey) {
                dispatch(setActiveQuoteKey(null));
                // setInteractionMode(MODE_GAME);
                // setPanelType(null);
              } else {
                if (!activeQuoteKey) {
                  dispatch(setActiveQuoteKey(currentQuoteKey));
                  return;
                }
                if (activeQuoteKey.split('_')[0] === turnId) {
                  dispatch(setActiveQuoteKey(currentQuoteKey));
                  return;
                }
                const connectedLines = filterLinesByQuoteKey(
                  lines,
                  currentQuoteKey
                );
                if (findLineByQuoteKey(connectedLines, activeQuoteKey)) {
                  dispatch(setActiveQuoteKey(currentQuoteKey));
                  return;
                }
                dispatch(
                  lineCreate({
                    sourceTurnId: activeQuoteKey.split('_')[0],
                    sourceMarker: activeQuoteKey.split('_')[1],
                    targetTurnId: currentQuoteKey.split('_')[0],
                    targetMarker: currentQuoteKey.split('_')[1],
                  })
                );
              }
            }}
          ></div>
        );
      })}
    </>
  );
};

export default ParagraphQuotes;

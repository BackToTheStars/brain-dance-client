import { quoteRectangleThickness } from '@/config/ui';
import {
  findLineByQuoteKey,
  getActiveQuotesDictionary,
} from '@/modules/lines/components/helpers/line';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ParagraphQuotes = ({ paragraphQuotes, turnId }) => {
  //
  const dispatch = useDispatch();

  const lines = useSelector((store) => store.lines.lines);
  const activeQuoteKey = useSelector((store) => store.quotes.activeQuoteKey);

  const activeQuotesDictionary = useMemo(() => {
    return getActiveQuotesDictionary(paragraphQuotes, lines);
  }, [paragraphQuotes, lines]);
  return (
    <>
      {paragraphQuotes.map((quote, i) => {
        // все цитаты
        let bordered = !!activeQuotesDictionary[quote.quoteId]; //!!lineEnds[`${quote.turnId}_${quote.quoteId}`]; // проверка нужно показывать рамку или нет
        let outline = '0px solid transparent';

        const currentQuoteKey = `${turnId}_${quote.quoteId}`;

        if (currentQuoteKey === activeQuoteKey) {
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
              dispatch(processQuoteClicked(currentQuoteKey));
            }}
          ></div>
        );
      })}
    </>
  );
};

export default ParagraphQuotes;

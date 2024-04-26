import { quoteRectangleThickness } from '@/config/ui';
import { getActiveQuotesDictionary } from '@/modules/lines/components/helpers/line';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Quote = memo(({ isActive, quote }) => {
  const { style, className } = useMemo(() => {
    let outline = '0px solid transparent';
    if (isActive) {
      outline = `${quoteRectangleThickness}px solid red`;
      if (quote.position === 'top' || quote.position === 'bottom') {
        outline = `${quoteRectangleThickness}px solid red`;
      }
    }
    return {
      style: {
        ...quote,
        outline,
      },
      className: `q_${quote.quoteKey} quote-rectangle`,
    };
  }, [quote, isActive]);

  return (
    <div
      className={className}
      style={style}
      onClick={() => {
        dispatch(processQuoteClicked(quote.quoteKey));
      }}
    ></div>
  );
});

const ParagraphQuotes = ({ turnId }) => {
  //
  const dispatch = useDispatch();
  const allQuotes = useSelector((state) => state.lines.quotesInfo[turnId]);
  const paragraphQuotes = useMemo(() => {
    // экономия вычислений на filter allQuotes
    if (!allQuotes) return [];
    return allQuotes.filter((quote) => quote.type === TYPE_QUOTE_TEXT);
  }, [allQuotes]);

  const dLines = useSelector((store) => store.lines.d); // @fixme
  const lines = useMemo(() => Object.values(dLines), [dLines]);
  const activeQuoteKey = useSelector((store) => store.quotes.activeQuoteKey);

  const activeQuotesDictionary = useMemo(() => {
    return getActiveQuotesDictionary(paragraphQuotes, lines);
  }, [paragraphQuotes, lines]);
  return (
    <>
      {paragraphQuotes.map((quote, i) => {
        return (
          <Quote
            key={i}
            isActive={
              !!activeQuotesDictionary[quote.quoteId] ||
              quote.quoteKey === activeQuoteKey
            }
            quote={quote}
          />
        );
      })}
    </>
  );
};

export default ParagraphQuotes;

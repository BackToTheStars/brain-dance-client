import { quoteRectangleThickness } from '@/config/ui';
import { getActiveQuotesDictionary } from '@/modules/lines/components/helpers/line';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Quote = memo(({ isActive, quote, can }) => {
  const dispatch = useDispatch();
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
      onWheel={(e) => {
        // добавить проверку для compressed paragraph
        const quouteInsideParagraphEl = document.querySelector(
          `.turn_${quote.turnId} span[data-id='${quote.quoteId}']`,
        );
        if (quouteInsideParagraphEl) {
          const pEl = quouteInsideParagraphEl.closest('.paragraphText');
          pEl.scrollTo({
            top: pEl.scrollTop + e.deltaY,
            behavior: 'smooth',
          })
        }
      }}
      className={className}
      style={style}
      onClick={() => {
        dispatch(processQuoteClicked(quote.quoteKey, can));
      }}
    ></div>
  );
});


const ParagraphQuotes = memo(({ turnId, widgetId }) => {
  const { can } = useUserContext();
  const rawParagraphQuotes = useSelector(
    (state) =>
      state.lines.quotesInfo[turnId]?.[widgetId],
  );

  const paragraphQuotes = useMemo(() => {
    if (!rawParagraphQuotes) return [];
    return rawParagraphQuotes;
  }, [rawParagraphQuotes]);

  const dLines = useSelector((store) => (store.lines ? store.lines.d : {})); // @fixme: optimize and update for storybook
  const lines = useMemo(() => Object.values(dLines), [dLines]);
  const activeQuoteKey = useSelector((store) => store?.quotes?.activeQuoteKey); // @fixme: update for storybook

  const activeQuotesDictionary = useMemo(() => {
    return getActiveQuotesDictionary(paragraphQuotes, lines);
  }, [paragraphQuotes, lines]);

  return (
    <>
      {paragraphQuotes.map((quote, i) => {
        return (
          <Quote
            can={can}
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
});

export default ParagraphQuotes;

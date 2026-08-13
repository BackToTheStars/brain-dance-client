// Рамки прямоугольных цитат PDF. Как и у текстовых цитат, компонент только
// рисует то, что уже посчитано в lines.quotesInfo (см. quotesGeometry.js) —
// из того же источника берутся якоря логических линий, поэтому рамка и конец
// линии всегда совпадают.

import { MODE_GAME, MODE_WIDGET_PDF_QUOTE_ACTIVE } from '@/config/panel';
import { quoteRectangleThickness } from '@/config/ui';
import { getActiveQuotesDictionary } from '@/modules/lines/components/helpers/line';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TID } from '@/config/testIds';

const Quote = memo(({ quote, isActive, isHidden, onClick, onWheel }) => {
  const style = useMemo(
    () => ({
      left: quote.left,
      top: quote.top,
      width: quote.width,
      height: quote.height,
      outline: `${quoteRectangleThickness}px solid ${isActive ? 'red' : 'grey'}`,
      visibility: isHidden ? 'hidden' : undefined,
    }),
    [quote, isActive, isHidden],
  );

  return (
    <div
      className={`q_${quote.quoteKey} quote-rectangle quote-rectangle_pdf`}
      style={style}
      data-test-id={TID.quoteRect}
      data-turn-id={quote.turnId}
      data-quote-key={quote.quoteKey}
      data-page-number={quote.page}
      onWheel={onWheel}
      onClick={onClick}
    />
  );
});

const PdfQuotes = ({ turnId, widgetId, scrollEl, activeQuoteId, isEdited }) => {
  const dispatch = useDispatch();
  const { can } = useUserContext();

  const rawQuotes = useSelector(
    (state) => state.lines.quotesInfo[turnId]?.[widgetId],
  );
  const quotes = useMemo(() => rawQuotes || [], [rawQuotes]);

  const dLines = useSelector((store) => store.lines.d);
  const lines = useMemo(() => Object.values(dLines), [dLines]);
  const activeQuoteKey = useSelector((store) => store.quotes?.activeQuoteKey);

  const activeQuotesDictionary = useMemo(
    () => getActiveQuotesDictionary(quotes, lines),
    [quotes, lines],
  );

  // колесо над рамкой должно прокручивать документ: слой цитат лежит НАД
  // скролл-контейнером и иначе съедал бы событие
  const wheelHandler = (e) => {
    if (!scrollEl?.current) return;
    scrollEl.current.scrollTop += e.deltaY;
  };

  return (
    <>
      {quotes.map((quote) => (
        <Quote
          key={quote.quoteId}
          quote={quote}
          isActive={
            !!activeQuotesDictionary[quote.quoteId] ||
            quote.quoteKey === activeQuoteKey ||
            quote.quoteId === activeQuoteId
          }
          // редактируемую цитату скрываем — вместо неё показывается crop
          isHidden={isEdited && quote.quoteId === activeQuoteId}
          onWheel={wheelHandler}
          onClick={() => {
            if (quote.quoteId === activeQuoteId) {
              dispatch(setPanelMode({ mode: MODE_GAME }));
              dispatch(processQuoteClicked(quote.quoteKey, can));
              return;
            }
            dispatch(
              setPanelMode({
                mode: MODE_WIDGET_PDF_QUOTE_ACTIVE,
                params: {
                  editTurnId: turnId,
                  editWidgetId: widgetId,
                  editWidgetParams: {
                    [`${turnId}_${widgetId}`]: {
                      activeQuoteId: quote.quoteId,
                      // страница цитаты становится активной: правка идёт
                      // только в пределах одной страницы
                      activePage: quote.page,
                    },
                  },
                },
              }),
            );
            dispatch(processQuoteClicked(quote.quoteKey, can));
          }}
        />
      ))}
    </>
  );
};

export default memo(PdfQuotes);

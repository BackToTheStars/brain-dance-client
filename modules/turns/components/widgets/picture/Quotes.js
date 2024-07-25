import {
  MODE_GAME,
  MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/config/panel';
import {
  quoteRectangleThickness,
  TURN_BORDER_THICKNESS,
  widgetSpacer,
} from '@/config/ui';
import { getActiveQuotesDictionary } from '@/modules/lines/components/helpers/line';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { TYPE_QUOTE_PICTURE } from '@/modules/quotes/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const PictureQuotes = ({
  turnId,
  widgetId,
  activeQuoteId,
  mode,
  wrapperEl,
  pictureOnly,
}) => {
  const dispatch = useDispatch();
  const turnQuotes = useSelector((state) => state.turns.d[turnId]?.quotes);
  const dLines = useSelector((store) => store.lines.dByTurnIdAndMarker[turnId]);

  const { width, height } = useSelector((state) => state.turns.g[turnId].size);

  const quotes = useMemo(() => {
    // @todo: quotes by widgetId
    if (!turnQuotes) return [];
    return turnQuotes
      .filter((quote) => quote.type === TYPE_QUOTE_PICTURE)
      .map((quote) => ({ ...quote, quoteId: quote.id, turnId }));
  }, [turnQuotes]);

  const activeQuotesDictionary = useMemo(() => {
    const d = {};
    for (const quote of quotes) {
      if (quote.turnId === turnId && dLines[quote.quoteId]) {
        d[quote.quoteId] = true;
      }
    }
    return d;
  }, [quotes, dLines, turnId]);
  useEffect(() => {
    if (!wrapperEl) return;
    const rect = wrapperEl.getBoundingClientRect();
    const turnEl = wrapperEl.closest('.stb-react-turn');
    const widgetTop = rect.top - turnEl.getBoundingClientRect().top;
    let width = Math.round(rect.width);
    let height = Math.round(rect.height);
    if (!width || !height) return;
    if (!quotes.length) return;
    dispatch(
      quoteCoordsUpdate(
        turnId,
        widgetId,
        quotes.map((quote) => {
          return {
            type: TYPE_QUOTE_PICTURE,
            initialCoords: {},
            quoteId: quote.id,
            quoteKey: `${turnId}_${quote.id}`,
            turnId,
            text: `pictureQuote_${quote.id}`,
            left:
              Math.round((width * quote.x) / 100) +
              (pictureOnly ? 0 : widgetSpacer),
            top:
              Math.round((height * quote.y) / 100) +
              (pictureOnly ? 0 : widgetSpacer) +
              2 +
              widgetTop,
            width: Math.round((width * quote.width) / 100),
            height: Math.round((height * quote.height) / 100),
          };
        }),
      ),
    );
  }, [quotes, wrapperEl, width, height]);

  return (
    <QuotesInner
      quotes={quotes}
      activeQuotesDictionary={activeQuotesDictionary}
      activeQuoteId={activeQuoteId}
      mode={mode}
      turnId={turnId}
      widgetId={widgetId}
    />
  );
};

const QuotesInner = memo(
  ({
    quotes,
    activeQuotesDictionary,
    activeQuoteId,
    mode,
    turnId,
    widgetId,
  }) => {
    const { can } = useUserContext();
    const dispatch = useDispatch();
    return (
      <div>
        {quotes.map((quote) => {
          let bordered = !!activeQuotesDictionary[quote.quoteId]; // !!lineEnds[`${turnId}_${quote.id}`]; // проверка нужно показывать рамку или нет
          const isQuoteActive = activeQuoteId === quote.id; // @todo: активен ли текущий виджет
          // activeQuote &&
          // activeQuote.turnId === turnId &&
          let outline = `${quoteRectangleThickness}px solid grey`;
          if (isQuoteActive) {
            bordered = true;
          }
          if (bordered) {
            outline = `${quoteRectangleThickness}px solid red`;
          }

          const style = {
            left: `${quote.x}%`,
            top: `${quote.y}%`,
            height: `${quote.height}%`,
            width: `${quote.width}%`,
            outline,
          };

          if (
            mode === MODE_WIDGET_PICTURE_QUOTE_ADD &&
            quote.id === activeQuoteId
          ) {
            style.visibility = 'hidden';
          }

          return (
            <div
              className="quote-rectangle"
              key={quote.id}
              style={style}
              onClick={() => {
                if (isQuoteActive) {
                  dispatch(setPanelMode({ mode: MODE_GAME }));
                  dispatch(processQuoteClicked(`${turnId}_${quote.id}`, can));
                  return;
                }
                dispatch(
                  setPanelMode({
                    mode: MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
                    params: {
                      editTurnId: turnId,
                      editWidgetId: widgetId,
                      editWidgetParams: {
                        [`${turnId}_${widgetId}`]: { activeQuoteId: quote.id },
                      },
                    },
                  }),
                );
                dispatch(processQuoteClicked(`${turnId}_${quote.id}`, can));
              }}
            />
          );
        })}
      </div>
    );
  },
);

export default memo(PictureQuotes);

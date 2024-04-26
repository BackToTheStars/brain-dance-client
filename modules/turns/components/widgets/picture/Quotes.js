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
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const PictureQuotes = ({
  turnId,
  widgetId,
  activeQuoteId,
  mode,
  widgetSettings = {},
  pictureOnly,
}) => {
  const dispatch = useDispatch();
  const turn = useSelector((state) => state.turns.d[turnId].data);
  const dLines = useSelector((store) => store.lines.d); // @fixme
  const lines = useMemo(() => Object.values(dLines), [dLines]);

  const quotes = useMemo(() => {
    return turn.quotes
      .filter((quote) => quote.type === TYPE_QUOTE_PICTURE)
      .map((quote) => ({ ...quote, quoteId: quote.id, turnId: turn._id }));
  }, [turn.quotes]);

  const activeQuotesDictionary = useMemo(() => {
    return getActiveQuotesDictionary(quotes, lines);
  }, [quotes, lines]);

  useEffect(() => {
    let width = widgetSettings.width;
    let height = widgetSettings.minHeight;

    if (!pictureOnly) {
      width =
        widgetSettings.width - 2 * widgetSpacer - 2 * TURN_BORDER_THICKNESS; // log3 поправили
      height = widgetSettings.minHeight - widgetSpacer; // - TURN_BORDER_THICKNESS;
    }

    if (!width || !height) return;
    if (!quotes.length) return;
    dispatch(
      quoteCoordsUpdate(
        turnId,
        TYPE_QUOTE_PICTURE,
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
              (pictureOnly ? 0 : widgetSpacer) +
              2,
            // quoteRectangleThickness
            top:
              Math.round((height * quote.y) / 100) +
              (pictureOnly ? 0 : widgetSpacer) +
              2 +
              widgetSettings.minTop,
            // + quoteRectangleThickness,
            width: Math.round((width * quote.width) / 100),
            height: Math.round((height * quote.height) / 100),
          };
        })
      )
    );
  }, [quotes, widgetSettings]);

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
                dispatch(processQuoteClicked(`${turnId}_${quote.id}`));
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
                })
              );
              dispatch(processQuoteClicked(`${turnId}_${quote.id}`));
            }}
          />
        );
      })}
    </div>
  );
};

export default PictureQuotes;

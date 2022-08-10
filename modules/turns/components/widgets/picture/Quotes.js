import { quoteRectangleThickness } from '@/config/ui';
import { getActiveQuotesDictionary } from '@/modules/lines/components/helpers/line';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { setPanelMode } from '@/modules/panels/redux/actions';
import {
  MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/modules/panels/settings';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { TYPE_QUOTE_PICTURE } from '@/modules/quotes/settings';
import { useDebugValue, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// import { quoteRectangleThickness } from '../../const';
// const quoteRectangleThickness = 2;
// import { ACTION_QUOTE_CLICKED } from '../../contexts/TurnsCollectionContext';
// import {
//   MODE_GAME,
//   MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
//   PANEL_LINES,
//   useInteractionContext,
// } from '../../contexts/InteractionContext';

const PictureQuotes = ({
  turnId,
  widgetId,
  activeQuoteId,
  mode,
  widgetSettings = {},
  // quotes,
  // dispatch,
  // activeQuote,
  // lineEnds,
  // setInteractionMode,
}) => {
  const dispatch = useDispatch();
  // const { bottomPanelSettings } = []; //useInteractionContext();
  // const { setPanelType } = bottomPanelSettings;
  const turn = useSelector((state) => state.turns.d[turnId]);
  const lines = useSelector((store) => store.lines.lines);

  const quotes = useMemo(() => {
    return turn.quotes
      .filter((quote) => quote.type === TYPE_QUOTE_PICTURE)
      .map((quote) => ({ ...quote, quoteId: quote.id, turnId: turn._id }));
  }, [turn.quotes]);

  const activeQuotesDictionary = useMemo(() => {
    return getActiveQuotesDictionary(quotes, lines);
  }, [quotes, lines]);

  console.log({ quotes, lines, activeQuotesDictionary });

  // const activeQuoteId = useSelector(
  //   (state) =>
  //     state.panels.editWidgetParams[`${turnId}_${widgetId}`]?.activeQuoteId
  // );
  //
  // const onQuoteClick = (quoteId) => {
  //   dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId, quoteId } });
  // };

  useEffect(() => {
    // console.log({ quotes });

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
            width: Math.round((widgetSettings.width * quote.width) / 100),
            height: Math.round((widgetSettings.minHeight * quote.height) / 100),
            left: Math.round((widgetSettings.width * quote.x) / 100),
            top:
              Math.round((widgetSettings.minHeight * quote.y) / 100) +
              widgetSettings.minTop,
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
              // onQuoteClick(quote.id);
              // if (isQuoteActive) {
              //   setInteractionMode(MODE_GAME);
              //   setPanelType(null);
              // } else {
              //   setInteractionMode(MODE_WIDGET_PICTURE_QUOTE_ACTIVE);
              //   setPanelType(PANEL_LINES);
              // }
            }}
          />
        );
      })}
    </div>
  );
};

export default PictureQuotes;

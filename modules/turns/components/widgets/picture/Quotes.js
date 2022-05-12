import { quoteRectangleThickness } from '@/config/ui';
import { setPanelMode } from '@/modules/panels/redux/actions';
import {
  MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/modules/panels/settings';
import { useDebugValue } from 'react';
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
  const quotes = turn.quotes.filter((quote) => quote.type === 'picture');
  // const activeQuoteId = useSelector(
  //   (state) =>
  //     state.panels.editWidgetParams[`${turnId}_${widgetId}`]?.activeQuoteId
  // );
  //
  // const onQuoteClick = (quoteId) => {
  //   dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId, quoteId } });
  // };

  return (
    <div>
      {quotes.map((quote) => {
        let bordered = false; // !!lineEnds[`${turnId}_${quote.id}`]; // проверка нужно показывать рамку или нет
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

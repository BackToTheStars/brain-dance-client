import * as types from './types';
import * as panelTypes from '@/modules/panels/redux/types';
import { PANEL_LINES } from '@/modules/panels/settings';
import { resaveTurn } from '@/modules/turns/redux/actions';

export const setActiveQuoteKey = (quoteKey) => (dispatch) => {
  dispatch({
    type: panelTypes.PANEL_TOGGLE,
    payload: { open: !!quoteKey, type: PANEL_LINES },
  });

  dispatch({
    type: types.QUOTE_SET_ACTIVE,
    payload: quoteKey,
  });
};

export const addPictureQuoteByCrop = () => (dispatch, getState) => {
  const state = getState();
  const editTurnId = state.panels.editTurnId;
  const turn = state.turns.d[editTurnId];
  const editWidgetId = state.panels.editWidgetId;
  const editWidgetParams =
    state.panels.editWidgetParams[`${editTurnId}_${editWidgetId}`];

  const zeroPointId = state.turns.zeroPointId;
  const zeroPoint = state.turns.d[zeroPointId];

  let id = Math.floor(new Date().getTime() / 1000); // @todo get quote id from store for update
  const { x, y, width, height } = editWidgetParams.crop;

  const pictureQuote = {
    id,
    type: 'picture',
    x,
    y,
    height,
    width,
  };

  dispatch(
    resaveTurn(
      {
        _id: turn._id,
        quotes: [...turn.quotes, pictureQuote], // @todo find quote and update
        x: turn.x - zeroPoint.x,
        y: turn.y - zeroPoint.y,
      },
      zeroPoint,

      {
        success: () => {
          // @todo: close panel
        },
      }
    )
  );

  console.log({
    editTurnId,
    editWidgetId,
    editWidgetParams,
  });
};

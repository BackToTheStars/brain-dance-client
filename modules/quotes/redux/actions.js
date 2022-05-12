import * as types from './types';
import * as panelTypes from '@/modules/panels/redux/types';
import { PANEL_LINES } from '@/modules/panels/settings';
import { resaveTurn } from '@/modules/turns/redux/actions';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';

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
  const { turn, editWidgetParams, zeroPoint } = getWidgetDataFromState(state);

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

  return new Promise((resolve, reject) => {
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
          success: resolve,
        }
      )
    );
  });
};

export const deleteQuote = () => (dispatch, getState) => {
  const state = getState();
  const { turn, editWidgetParams, zeroPoint } = getWidgetDataFromState(state);

  let id = editWidgetParams.activeQuoteId;

  return new Promise((resolve, reject) => {
    dispatch(
      resaveTurn(
        {
          _id: turn._id,
          quotes: turn.quotes.filter((quote) => quote.id !== id), // @todo find quote and update
          x: turn.x - zeroPoint.x,
          y: turn.y - zeroPoint.y,
        },
        zeroPoint,
        {
          success: resolve, // @todo: заменить на Promise
          error: reject,
        }
      )
    );
  });
};

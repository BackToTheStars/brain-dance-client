import * as types from './types';
import * as panelTypes from '@/modules/panels/redux/types';
import { PANEL_LINES } from '@/modules/panels/settings';
import { resaveTurn } from '@/modules/turns/redux/actions';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';
import {
  filterLinesByQuoteKey,
  filterLinesByQuoteKeys,
  findLineByQuoteKey,
} from '@/modules/lines/components/helpers/line';
import { lineCreate, linesDelete } from '@/modules/lines/redux/actions';
import { useSelector } from 'react-redux';

export const setActiveQuoteKey = (quoteKey) => (dispatch) => {
  dispatch({
    type: types.QUOTE_SET_ACTIVE,
    payload: quoteKey,
  });

  dispatch({
    type: panelTypes.PANEL_TOGGLE,
    payload: { open: !!quoteKey, type: PANEL_LINES },
  });
};

export const savePictureQuoteByCrop = () => (dispatch, getState) => {
  const state = getState();
  const { turn, editWidgetParams, zeroPoint } = getWidgetDataFromState(state);
  const { x, y, width, height } = editWidgetParams.crop;
  const { activeQuoteId } = editWidgetParams;

  let id = activeQuoteId || Math.floor(new Date().getTime() / 1000);

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
          quotes: activeQuoteId
            ? turn.quotes.map((quote) =>
                quote.id === activeQuoteId ? pictureQuote : quote
              )
            : [...turn.quotes, pictureQuote],
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

export const processQuoteClicked =
  (currentQuoteKey) => (dispatch, getState) => {
    const state = getState();
    const activeQuoteKey = state.quotes.activeQuoteKey;
    const turnId = currentQuoteKey.split('_')[0];
    const lines = state.lines.lines;

    if (activeQuoteKey === currentQuoteKey) {
      dispatch(setActiveQuoteKey(null));
      // setInteractionMode(MODE_GAME);
      // setPanelType(null);
    } else {
      if (!activeQuoteKey) {
        dispatch(setActiveQuoteKey(currentQuoteKey));
        return;
      }
      // if (activeQuoteKey.split('_')[0] === turnId) {
      //   dispatch(setActiveQuoteKey(currentQuoteKey));
      //   return;
      // }
      const connectedLines = filterLinesByQuoteKey(lines, currentQuoteKey);
      if (findLineByQuoteKey(connectedLines, activeQuoteKey)) {
        dispatch(setActiveQuoteKey(currentQuoteKey));
        return;
      }
      dispatch(
        lineCreate({
          sourceTurnId: activeQuoteKey.split('_')[0],
          sourceMarker: activeQuoteKey.split('_')[1],
          targetTurnId: currentQuoteKey.split('_')[0],
          targetMarker: currentQuoteKey.split('_')[1],
        })
      );
      dispatch(setActiveQuoteKey(null));
    }
  };

export const deleteQuote = () => (dispatch, getState) => {
  const state = getState();
  const { turn, editWidgetParams, zeroPoint } = getWidgetDataFromState(state);
  const { lines } = state.lines;

  let id = editWidgetParams.activeQuoteId;

  const linesToDelete = filterLinesByQuoteKey(lines, `${turn._id}_${id}`);

  if (!!linesToDelete.length) {
    dispatch(linesDelete(linesToDelete.map((l) => l._id)));
  }

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

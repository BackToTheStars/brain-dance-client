import { increment } from '@/modules/telemetry/utils/logger';
import { createLinesRequest, deleteLinesRequest } from '../requests';
import * as types from './types';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';

export const quoteCoordsUpdate =
  (turnId, type, quotesWithCoords) => (dispatch) => {
    increment('quoteCoordsUpdate');
    return dispatch({
      type: types.LINES_QUOTE_COORDS_UPDATE,
      payload: { turnId, quotesWithCoords, type },
    });
  };

// @deprecated
export const linesWithEndCoordsUpdate = (linesWithEndCoords) => (dispatch) => {
  increment('LINES_WITH_END_COORDS_UPDATE');
  return dispatch({
    type: types.LINES_WITH_END_COORDS_UPDATE,
    payload: linesWithEndCoords,
  });
};

export const lineDelete = (id) => (dispatch) => {
  deleteLinesRequest([id]).then((data) => {
    dispatch({
      type: types.LINE_DELETE,
      payload: { id },
    });
    dispatch(setActiveQuoteKey(null));
  });
};

export const linesDelete = (ids) => (dispatch) => {
  return new Promise((resolve, reject) => {
    if (!ids.length) return resolve(ids);
    deleteLinesRequest(ids).then((data) => {
      dispatch({
        type: types.LINES_DELETE,
        payload: { ids },
      });
      resolve(ids);
    });
  });
};

export const lineCreate = (line) => (dispatch) => {
  createLinesRequest({ lines: [line] }).then((data) => {
    dispatch({
      type: types.LINES_ADDED,
      payload: data.items,
    });
  });
};

export const linesCreate = (lines) => (dispatch) => {
  createLinesRequest({ lines }).then((data) => {
    dispatch({
      type: types.LINES_ADDED,
      payload: data.items,
    });
  });
};

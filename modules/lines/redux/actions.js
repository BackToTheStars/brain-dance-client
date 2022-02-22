import * as types from './types';

export const quoteCoordsUpdate = (turnId, quotesWithCoords) => (dispatch) =>
  dispatch({
    type: types.LINES_QUOTE_COORDS_UPDATE,
    payload: { turnId, quotesWithCoords },
  });

export const linesWithEndCoordsUpdate = (linesWithEndCoords) => (dispatch) =>
  dispatch({
    type: types.LINES_WITH_END_COORDS_UPDATE,
    payload: linesWithEndCoords,
  });


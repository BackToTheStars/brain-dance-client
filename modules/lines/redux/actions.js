import { createLinesRequest, deleteLinesRequest } from '../requests';
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

export const lineDelete = (id) => (dispatch) => {
  deleteLinesRequest([id]).then((data) => {
    dispatch({
      type: types.LINE_DELETE,
      payload: { id },
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

import * as types from './types';

const initialLinesState = {
  lines: [],
  linesWithEndCoords: [],
  quotesInfo: {},
  error: null,
};

export const linesReducer = (state = initialLinesState, { type, payload }) => {
  switch (type) {
    case types.LOAD_LINES:
      return {
        ...state,
        lines: payload,
      };
    case types.LINES_ADDED:
      return {
        ...state,
        lines: [...state.lines, ...payload],
      };
    case types.LINES_WITH_END_COORDS_UPDATE:
      return {
        ...state,
        linesWithEndCoords: payload,
      };
    case types.LINES_QUOTE_COORDS_UPDATE:
      const { turnId, quotesWithCoords } = payload;
      return {
        ...state,
        quotesInfo: { ...state.quotesInfo, [turnId]: quotesWithCoords },
      };
    default:
      return state;
  }
};

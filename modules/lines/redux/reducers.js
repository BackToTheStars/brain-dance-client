import * as types from './types';

const initialLinesState = {
  lines: [],
  linesWithEndCoords: [],
  quotesInfo: {},
  error: null,
};

export const linesReducer = (state = initialLinesState, { type, payload }) => {
  switch (type) {
    case types.LINES_LOAD:
      return {
        ...state,
        lines: payload,
      };
    case types.LINES_ADDED:
      return {
        ...state,
        lines: [...state.lines, ...payload],
      };
    case types.LINE_DELETE:
      return {
        ...state,
        lines: state.lines.filter((line) => line._id !== payload.id),
      };
    case types.LINES_DELETE:
      const d = {};
      for (let id of payload.ids) {
        d[id] = true;
      }
      return {
        ...state,
        lines: state.lines.filter((line) => d[line._id]),
      };
    case types.LINES_WITH_END_COORDS_UPDATE:
      return {
        ...state,
        linesWithEndCoords: payload,
      };
    case types.LINES_QUOTE_COORDS_UPDATE:
      const { turnId, quotesWithCoords, type } = payload;
      return {
        ...state,
        quotesInfo: {
          ...state.quotesInfo,
          [turnId]: [
            ...(state.quotesInfo[turnId]?.filter(
              (quote) => quote.type !== type
            ) || []),
            ...quotesWithCoords,
          ],
        },
      };
    default:
      return state;
  }
};

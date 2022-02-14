import * as types from './types';

const initialLinesState = {
  lines: [],
  error: null,
};

export const linesReducer = (state = initialLinesState, { type, payload }) => {
  switch (type) {
    case types.LOAD_LINES:
      return {
        ...state,
        lines: payload
      }
    default:
      return state;
  }
};

import * as types from './types';

const initialState = {
  activeQuoteKey: null,
};

export const quoteReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.QUOTE_SET_ACTIVE:
      return {
        ...state,
        activeQuoteKey: payload,
      };

    default:
      return state;
  }
};

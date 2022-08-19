import * as types from './types';

const initialState = {
  activeQuoteKey: null,
  d: {},
};

export const quoteReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.QUOTE_SET_ACTIVE:
      return {
        ...state,
        activeQuoteKey: payload,
      };
    case types.QUOTES_SET_DICTIONARY:
      return {
        ...state,
        d: payload,
      };
    case types.QUOTES_UPDATE_DICTIONARY:
      return {
        ...state,
        d: { ...state.d, ...payload },
      };

    default:
      return state;
  }
};

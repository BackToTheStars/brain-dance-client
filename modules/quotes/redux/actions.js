import * as types from './types';

export const setActiveQuoteKey = (quoteKey) => (dispatch) => {
  dispatch({
    type: types.QUOTE_SET_ACTIVE,
    payload: quoteKey,
  });
};

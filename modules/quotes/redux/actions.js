import * as types from './types';
import * as panelTypes from '@/modules/panels/redux/types';
import { PANEL_LINES } from '@/modules/panels/settings';

export const setActiveQuoteKey = (quoteKey) => (dispatch) => {
  dispatch({
    type: panelTypes.PANEL_SET_OPEN,
    payload: { isDisplayed: !!quoteKey, type: PANEL_LINES },
  });

  dispatch({
    type: types.QUOTE_SET_ACTIVE,
    payload: quoteKey,
  });
};

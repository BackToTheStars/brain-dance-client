import * as types from './types';

export const togglePanel = (panelType) => (dispatch) => {
  dispatch({
    type: types.PANEL_TOGGLE,
    payload: panelType,
  });
};

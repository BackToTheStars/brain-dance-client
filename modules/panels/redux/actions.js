import * as types from './types';

export const togglePanel = (panelType) => (dispatch) => {
  dispatch({
    type: types.PANEL_TOGGLE,
    payload: panelType,
  });
};

export const setTurnToEdit = (id) => (dispatch) => {
  dispatch({
    type: types.PANEL_SET_TURN_TO_EDIT,
    payload: id,
  });
};

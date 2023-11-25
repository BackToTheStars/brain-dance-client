import { loadTurnsByGameRequest, loadTurnsChronoRequest } from './requests';
import * as types from './types';
// import { loadTurnsRequest } from './requests';

export const openModal = (type, params) => (dispatch) => {
  dispatch({
    type: types.LOBBY_MODAL_SET,
    payload: { open: true, type, params },
  });
};

export const closeModal = () => (dispatch) => {
  dispatch({
    type: types.LOBBY_MODAL_SET,
    payload: { open: false, type: null, params: {} },
  });
};

export const loadTurns = () => (dispatch, getState) => {
  const mode = getState().lobby.mode;
  const loadTurnsRequest =
    mode === 'byGame' ? loadTurnsByGameRequest : loadTurnsChronoRequest;
  return loadTurnsRequest().then((data) => {
    dispatch({
      type: types.LOBBY_TURNS_LOAD,
      payload: data.items,
    });
  });
};

export const switchMode = (mode) => (dispatch) => {
  dispatch({ type: types.LOBBY_MODE_SET, payload: mode });
};

const sidebarObj = {};
export const toggleSidebar = (sidebar) => (dispatch, getState) => {
  const state = getState();
  sidebarObj[sidebar] =
    sidebar in state.lobby.sidebar ? !state.lobby.sidebar[sidebar] : true;
  return dispatch({
    type: types.LOBBY_SIDEBAR,
    payload: { ...sidebarObj },
  });
};

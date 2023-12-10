import {
  loadGamesRequest,
  loadTurnsByGameRequest,
  loadTurnsChronoRequest,
} from './requests';
import * as types from './types';
// import { loadTurnsRequest } from './requests';

export const changeTextSettings = (field, value) => (dispatch) => {
  dispatch({
    type: types.LOBBY_TEXT_SETTINGS_SET,
    payload: { field, value },
  });
};

export const changeLayoutSettings = (field, value) => (dispatch) => {
  dispatch({
    type: types.LOBBY_LAYOUT_SETTINGS_SET,
    payload: { field, value },
  });
};

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

export const openSliderModal = (type, params) => (dispatch) => {
  dispatch({
    type: types.LOBBY_SLIDER_MODAL_SET,
    payload: { open: true, type, params },
  });
};

export const closeSliderModal = () => (dispatch) => {
  dispatch({
    type: types.LOBBY_SLIDER_MODAL_SET,
    payload: { open: false, type: null, params: {} },
  });
};

export const loadGames = () => (dispatch) => {
  return loadGamesRequest().then((data) => {
    const dictionaryGames = data.items.reduce((acc, obj) => {
      return {
        ...acc,
        [obj._id]: obj,
      };
    }, {});
    dispatch({
      type: types.LOBBY_GAMES_LOAD,
      payload: { items: data.items, d: dictionaryGames },
    });
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

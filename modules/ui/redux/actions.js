import * as types from './types';
import { serialize as serializeCookie } from 'cookie';

import { NOTIFICATION_SHOWTIME, NOTIFICATION_TRANSITION } from '@/config/ui';

export const addNotification =
  ({ title, text }) =>
  (dispatch) => {
    const id = new Date().getTime();
    dispatch({
      type: types.NOTIFICATION_ADD,
      payload: { id, title, text },
    });
    setTimeout(() => {
      dispatch({
        type: types.NOTIFICATION_UPDATE,
        payload: { id },
      });
    }, NOTIFICATION_SHOWTIME);
    setTimeout(() => {
      dispatch({
        type: types.NOTIFICATION_DELETE,
        payload: { id },
      });
    }, NOTIFICATION_SHOWTIME + NOTIFICATION_TRANSITION);
  };

export const viewportGeometryUpdate =
  ({ viewport }) =>
  (dispatch) => {
    dispatch({
      type: types.VIEWPORT_UPDATE,
      payload: { viewport },
    });
  };

export const setSpecificSettings =
  ({ group, field, size, value }) =>
  (dispatch) => {
    dispatch({
      type: types.UI_SPECIFIC_SETTINGS_SET,
      payload: { group, field, size, value },
    });
  };

const _saveInCookieForYear = (name, value) => {
  const serializedCookie = serializeCookie(name, value, {
    maxAge: 60 * 60 * 24 * 365, // Максимальный срок действия в секундах (1 год)
    path: '/',
  });
  document.cookie = serializedCookie;
};

const _removeCookie = (name) => {
  document.cookie = serializeCookie(name, '', {
    maxAge: -1,
  });
};

export const setColorSchema = (value) => (dispatch, getState) => {
  const state = getState();
  if (state.ui.themeSettings.colorSchema === value) {
    return;
  }
  _saveInCookieForYear('colorSchema', value);
  dispatch({ type: types.SET_COLOR_SCHEMA, payload: value });
};

export const setSizeSchema = (value) => (dispatch) => {
  _saveInCookieForYear('sizeSchema', value);
  dispatch({ type: types.SET_SIZE_SCHEMA, payload: value });
};

export const setMode = (value) => (dispatch) => {
  _saveInCookieForYear('mode', value);
  dispatch({ type: types.SET_MODE, payload: value });
};

export const resetThemeSettings = () => (dispatch) => {
  _removeCookie('colorSchema');
  _removeCookie('sizeSchema');
  _removeCookie('mode');
  dispatch({ type: types.RESET_THEME_SETTINGS });
};

export const openModal = (type, params) => (dispatch) => {
  dispatch({
    type: types.UI_MODAL_SET,
    payload: { open: true, type, params },
  });
};

export const closeModal = () => (dispatch) => {
  dispatch({
    type: types.UI_MODAL_SET,
    payload: { open: false, type: null, params: {} },
  });
};

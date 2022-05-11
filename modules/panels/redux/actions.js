import { MODE_GAME, MODE_WIDGET_PICTURE } from '../settings';
import * as types from './types';

export const togglePanel = (panelType) => (dispatch) => {
  dispatch({
    type: types.PANEL_TOGGLE,
    payload: panelType,
  });
};

export const changePanelGeometry = (type, geometryData) => (dispatch) => {
  // const geometryData = {};
  // if (geometryRawData?.width) {
  //   geometryData.width = () => `${geometryRawData.width}.px`;
  // }
  // console.log({ geometryData });
  dispatch({
    type: types.PANEL_CHANGE_GEOMETRY,
    payload: { type, geometryData },
  });
};

export const setPanelMode = (payload) => (dispatch) => {
  let params = payload.params || {};
  if (!payload.params) {
    if (payload.mode === MODE_GAME) {
      params = {
        editTurnId: null,
        editWidgetId: null,
        editWidgetParams: {},
      };
    } else if (payload.mode === MODE_WIDGET_PICTURE) {
      params = {
        editWidgetParams: {},
      };
    }
  }

  dispatch({
    type: types.PANEL_CHANGE_MODE,
    payload: {
      params,
      ...payload,
    },
  });
};

export const changeWidgetParams = (payload) => (dispatch) => {
  dispatch({
    type: types.PANEL_CHANGE_WIDGET_PARAMS,
    payload: payload, // widgetKey, params
  });
};

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
  dispatch({
    type: types.PANEL_CHANGE_MODE,
    payload: payload,
  });
};

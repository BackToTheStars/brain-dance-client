import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';
import {
  MODE_GAME,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '../settings';
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

export const setPanelMode = (payload) => (dispatch, getState) => {
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
    } else if (payload.mode === MODE_WIDGET_PICTURE_QUOTE_ADD) {
      const state = getState();
      const { turn, editWidgetParams, editWidgetId } =
        getWidgetDataFromState(state);
      if (!!editWidgetParams.activeQuoteId) {
        const activeQuote =
          state.quotes.d[`${turn._id}_${editWidgetParams.activeQuoteId}`];
        params = {
          editWidgetParams: {
            [`${turn._id}_${editWidgetId}`]: {
              activeQuoteId: editWidgetParams.activeQuoteId,
              crop: {
                unit: '%',
                x: activeQuote.x,
                y: activeQuote.y,
                width: activeQuote.width,
                height: activeQuote.height,
              },
            },
          },
        };
      }
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

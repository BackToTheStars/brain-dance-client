import { switchEditMode } from '@/modules/game/game-redux/actions';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';
import {
  MODE_GAME,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/config/panel';
import * as types from './types';
import { PANEL_ADD_EDIT_TURN, PANEL_BUTTONS } from '../settings';

export const resetAndExit =
  ({ exitEditMode = true } = {}) =>
  (dispatch) => {
    if (exitEditMode) dispatch(switchEditMode(false));
    dispatch({ type: types.PANELS_WIDGETS_QUOTES_RESET });
    dispatch(setActiveQuoteKey(null));
  };

export const togglePanel = (payload) => (dispatch) => {
  dispatch({
    type: types.PANEL_TOGGLE,
    payload: payload,
  });
};

export const toggleMinimizePanel = (payload) => (dispatch) => {
  dispatch({
    type: types.PANEL_TOGGLE_MINIMIZE,
    payload: payload,
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
      const { turnData, editWidgetParams, editWidgetId } =
        getWidgetDataFromState(state);
      if (!!editWidgetParams?.activeQuoteId) {
        const activeQuote =
          state.quotes.d[`${turnData._id}_${editWidgetParams.activeQuoteId}`];
        params = {
          editWidgetParams: {
            [`${turnData._id}_${editWidgetId}`]: {
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

export const toggleMaximizeQuill = (isMaximized) => (dispatch) => {
  dispatch(
    changePanelGeometry(PANEL_ADD_EDIT_TURN, {
      priorityStyle: isMaximized ? { bottom: '10px' } : { bottom: null },
    })
  );
  dispatch(togglePanel({ type: PANEL_BUTTONS, open: !isMaximized }));
};

import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';
import {
  MODE_GAME,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/config/panel';
import * as types from './types';
import { PANEL_ADD_EDIT_TURN, PANEL_BUTTONS } from '../settings';

export const resetAndExit = () => (dispatch) => {
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
      // debugger
      // if (!!editWidgetParams?.activeQuoteId) {
      //   const activeQuote =
      //     state.lines.dByTurnIdAndMarker[turnData._id][
      //       editWidgetParams.activeQuoteId
      //     ];
      //   params = {
      //     editWidgetParams: {
      //       [`${turnData._id}_${editWidgetId}`]: {
      //         activeQuoteId: editWidgetParams.activeQuoteId,
      //         crop: {
      //           unit: '%',
      //           x: activeQuote.x,
      //           y: activeQuote.y,
      //           width: activeQuote.width,
      //           height: activeQuote.height,
      //         },
      //       },
      //     },
      //   };
      // }
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
    }),
  );
  dispatch(togglePanel({ type: PANEL_BUTTONS, open: !isMaximized }));
};

export const setPanels =
  ({ d }) =>
  (dispatch) => {
    dispatch({
      type: types.PANELS_SET,
      payload: { d },
    });
  };

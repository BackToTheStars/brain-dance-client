import { MODE_GAME } from '@/config/panel';
import { panels } from '../settings';
import * as types from './types';

const d = {};
for (let panel of panels) {
  d[panel.type] = panel;
}

const initialPanelState = {
  d: d,
  editTurnId: null,
  editWidgetId: null,
  editWidgetParams: {},
  mode: MODE_GAME,
};

export const panelReducer = (state = initialPanelState, { type, payload }) => {
  switch (type) {
    case types.PANEL_TOGGLE: {
      let newValue = false;
      if (typeof payload?.open === 'boolean') {
        newValue = payload.open;
      } else {
        newValue = !state.d[payload.type].isDisplayed;
      }
      return {
        ...state,
        ...payload.params,
        d: {
          ...state.d,
          [payload.type]: {
            ...state.d[payload.type],
            isDisplayed: newValue,
          },
        },
      };
    }

    case types.PANEL_TOGGLE_MINIMIZE: {
      return {
        ...state,
        ...payload.params,
        d: {
          ...state.d,
          [payload.type]: {
            ...state.d[payload.type],
            isMinimized:
              !!payload?.minimize || !state.d[payload.type].isMinimized,
          },
        },
      };
    }

    case types.PANEL_CHANGE_GEOMETRY:
      return {
        ...state,
        d: {
          ...state.d,
          [payload.type]: {
            ...state.d[payload.type],
            ...payload.geometryData,
          },
        },
      };

    case types.PANEL_CHANGE_MODE:
      return {
        ...state,
        ...payload.params,
        mode: payload.mode,
      };

    case types.PANEL_CHANGE_WIDGET_PARAMS:
      return {
        ...state,
        editWidgetParams: {
          ...state.editWidgetParams,
          [payload.widgetKey]: payload.params,
        },
      };

    case types.PANELS_WIDGETS_QUOTES_RESET:
      return {
        ...state,
        editTurnId: null,
        editWidgetId: null,
        editWidgetParams: {},
        mode: MODE_GAME,
      };

    case types.PANELS_SET:
      return {
        ...state,
        d: payload.d,
      };
    default:
      return state;
  }
};

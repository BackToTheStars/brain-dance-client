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
  // Счётчик сбросов раскладки в Info: открытые формы и панели перечитывают по нему
  // то, что держат в своём состоянии (шрифт редактора, вид панели онлайн).
  layoutResets: 0,
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

    case types.PANELS_USER_RESET: {
      const next = { ...state.d };
      for (const panel of panels) {
        if (!panel.userFields || !next[panel.type]) continue;
        const defaults = {};
        for (const field of panel.userFields) defaults[field] = panel[field];
        next[panel.type] = { ...next[panel.type], ...defaults };
      }
      return {
        ...state,
        d: next,
        layoutResets: state.layoutResets + 1,
      };
    }
    default:
      return state;
  }
};

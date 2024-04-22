import { MODE_GAME } from '@/config/panel';
import { panels as panelState } from '../settings';
import { getInitialPanels } from './storage';
import * as types from './types';

const panels = getInitialPanels(panelState);

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

  //   [{
  //     type: PANEL_CLASSES,
  //     position: POSITION_UPPER_LEFT,
  //     component: ClassList,
  //     isDisplayed: true,
  //     id: 1,
  //     height: () => {
  //       console.log(window.innerHeight, panelSpacer);
  //       return `${window.innerHeight - 2 * panelSpacer}px`;
  //     },
  //     width: () => '500px',
  //   }]
};

export const panelReducer = (state = initialPanelState, { type, payload }) => {
  switch (type) {
    case types.PANEL_TOGGLE: {
      return {
        ...state,
        ...payload.params,
        d: {
          ...state.d,
          [payload.type]: {
            ...state.d[payload.type],
            isDisplayed: !!payload?.open || !state.d[payload.type].isDisplayed,
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
            isMinimized: !!payload?.minimize || !state.d[payload.type].isMinimized,
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

    default:
      return state;
  }
};

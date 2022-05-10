import { MODE_GAME, panels } from '../settings';
import * as types from './types';

const d = {};
for (let panel of panels) {
  d[panel.type] = panel;
}

const initialPanelState = {
  panels: panels,
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
      let open = null;
      if (typeof payload.open === 'undefined') {
        open = !state.d[payload.type].isDisplayed;
      } else {
        open = payload.open;
      }
      return {
        ...state,
        ...payload.params,
        d: {
          ...state.d,
          [payload.type]: {
            ...state.d[payload.type],
            isDisplayed: open,
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

    default:
      return state;
  }
};

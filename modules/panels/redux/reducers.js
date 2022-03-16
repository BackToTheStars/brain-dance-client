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
    case types.PANEL_TOGGLE:
      return {
        ...state,
        // panels: state.panels.map((panel) => {
        //   if (panel.type === payload.type) {
        //     return { ...panel, isDisplayed: !panel.isDisplayed };
        //   } else return panel;
        // }),
        d: {
          ...state.d,
          [payload.type]: {
            ...state.d[payload.type],
            isDisplayed: !state.d[payload.type].isDisplayed,
          },
        },
      };
    case types.PANEL_SET_TURN_TO_EDIT:
      return {
        ...state,
        editTurnId: payload,
      };
    default:
      return state;
  }
};

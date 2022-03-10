import { panels } from '../settings';
import * as types from './types';

const initialPanelState = {
  panels: panels,

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
        panels: state.panels.map((panel) => {
          if (panel.type === payload.type) {
            return { ...panel, isDisplayed: !panel.isDisplayed };
          } else return panel;
        }),
      };
    default:
      return state;
  }
};

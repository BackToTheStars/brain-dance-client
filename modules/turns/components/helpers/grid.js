import { PANEL_SNAP_TO_GRID } from '@/modules/panels/settings';

export const isSnapToGridSelector = (state) => {
  return state.panels.d[PANEL_SNAP_TO_GRID].isDisplayed;
};

export const snapRound = (value, base) => {
  return Math.round(value / base) * base;
};

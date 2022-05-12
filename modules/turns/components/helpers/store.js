export const getWidgetDataFromState = (state) => {
  const editTurnId = state.panels.editTurnId;
  const turn = state.turns.d[editTurnId];
  const editWidgetId = state.panels.editWidgetId;
  const editWidgetParams =
    state.panels.editWidgetParams[`${editTurnId}_${editWidgetId}`];

  const zeroPointId = state.turns.zeroPointId;
  const zeroPoint = state.turns.d[zeroPointId];

  return { turn, editWidgetId, editWidgetParams, zeroPoint };
};

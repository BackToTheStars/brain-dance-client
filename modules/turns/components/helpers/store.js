// @todo: проверить, нужна ли функция
export const getWidgetDataFromState = (state) => {
  const editTurnId = state.panels.editTurnId;
  const turnData = state.turns.d[editTurnId];
  const turnGeometry = state.turns.g[editTurnId];
  const editWidgetId = state.panels.editWidgetId;
  const editWidgetParams =
    state.panels.editWidgetParams[`${editTurnId}_${editWidgetId}`];

  return { turnData, turnGeometry, editWidgetId, editWidgetParams };
};
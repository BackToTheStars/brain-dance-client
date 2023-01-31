// @todo: проверить, нужна ли функция
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

export const paragraphStateSaveToLocalStorage = (textPieces, turnId) => {
  localStorage.setItem(
    `compressedParagraphState_${turnId}`,
    JSON.stringify({ time: Date.now(), textPieces })
  );
};

export const paragraphStateGetFromLocalStorage = (turnId) => {
  const res = localStorage.getItem(`compressedParagraphState_${turnId}`);
  return res ? JSON.parse(res) : null;
};

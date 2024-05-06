// @todo: проверить, нужна ли функция
export const getWidgetDataFromState = (state) => {
  const editTurnId = state.panels.editTurnId;
  const turnData = state.turns.d[editTurnId].data;
  const turnGeometry = state.turns.g[editTurnId];
  const editWidgetId = state.panels.editWidgetId;
  const editWidgetParams =
    state.panels.editWidgetParams[`${editTurnId}_${editWidgetId}`];

  return { turnData, turnGeometry, editWidgetId, editWidgetParams };
};

export const paragraphStateSaveToLocalStorage = ({
  textPieces,
  turnId,
  height,
  width,
  updatedAt,
}) => {
  localStorage.setItem(
    `compressedParagraphState_${turnId}`,
    JSON.stringify({ time: updatedAt, turnId, width, height, textPieces })
  );
};

export const paragraphStateGetFromLocalStorage = (turnId) => {
  const res = localStorage.getItem(`compressedParagraphState_${turnId}`);
  return res ? JSON.parse(res) : null;
};

export const paragraphStateDeleteFromLocalStorage = (turnId) => {
  localStorage.removeItem(`compressedParagraphState_${turnId}`);
};

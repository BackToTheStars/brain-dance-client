// Что Save Field отправит из ходов: геометрия и прокрутка (позиция холста и панели — не в признаке).
// Импортирует только размеры сетки: так он не замыкает цикл с game и presence.
import { GRID_CELL_X, GRID_CELL_Y } from '@/config/ui';

const isOffGrid = (turn) =>
  turn.position.x % GRID_CELL_X !== 0 ||
  turn.position.y % GRID_CELL_X !== 0 ||
  turn.size.width % GRID_CELL_X !== 0 ||
  turn.size.height % GRID_CELL_Y !== 0;

// Ход не сохранён, когда геометрия отличается от `turns.saved` или стоит не по сетке.
// Разделитель без загруженного тела хода не сравнивается: без карточки его не сдвинуть.
export const isTurnUnsaved = (state, id) => {
  const turn = state.turns.g[id];
  const saved = state.turns.saved[id];
  if (!saved) return true;
  if (
    turn.position.x !== saved.x ||
    turn.position.y !== saved.y ||
    turn.size.width !== saved.width ||
    turn.size.height !== saved.height
  ) {
    return true;
  }
  const data = state.turns.d[id];
  if (data && (data.splitHeight ?? null) !== (saved.splitHeight ?? null)) {
    return true;
  }
  return isOffGrid(turn);
};

// Восстановление сохранённой прокрутки само вызывает обработчик scroll, и запись
// о ней появляется на каждой загрузке: отправлять нечего, пока значение совпадает
// с сохранённым.
const isScrollUnsaved = (state, key) => {
  const { turnId, widgetId, scrollPosition } = state.turns.scrollPositions[key];
  const saved =
    state.turns.savedScroll[key] ??
    state.turns.d[turnId]?.dWidgets?.[widgetId]?.scrollPosition ??
    0;
  return saved !== scrollPosition;
};

export const selectUnsavedTurnIds = (state) =>
  Object.keys(state.turns.g).filter((id) => isTurnUnsaved(state, id));

export const selectUnsavedScrollPositions = (state) =>
  Object.keys(state.turns.scrollPositions)
    .filter((key) => isScrollUnsaved(state, key))
    .map((key) => state.turns.scrollPositions[key]);

export const selectFieldDirty = (state) => {
  for (const key in state.turns.scrollPositions) {
    if (isScrollUnsaved(state, key)) return true;
  }
  for (const id in state.turns.g) {
    if (isTurnUnsaved(state, id)) return true;
  }
  return false;
};

// Строка несохранённого состояния: меняется с каждой правкой, которую ждёт запись,
// и пуста, когда записывать нечего. По ней автосохранение перезапускает ожидание.
export const selectUnsavedSignature = (state) => {
  const { g, d } = state.turns;
  const parts = selectUnsavedTurnIds(state).map((id) => {
    const { position, size } = g[id];
    return `${id}:${position.x},${position.y},${size.width},${size.height},${d[id]?.splitHeight ?? ''}`;
  });
  for (const { turnId, widgetId, scrollPosition } of selectUnsavedScrollPositions(state)) {
    parts.push(`${turnId}_${widgetId}:${scrollPosition}`);
  }
  return parts.join(';');
};

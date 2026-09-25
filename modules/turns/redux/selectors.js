// Что «Save Field» отправит на сервер из состояния ходов: геометрия карточек и
// позиции прокрутки виджетов. Позиция холста и настройки панелей уходят тем же
// нажатием, но в этот признак не входят — решение пользователя.
// Файл не импортирует ничего, кроме размеров сетки: его безопасно звать из любого
// модуля, цикла с game и presence он не закрывает.
import { GRID_CELL_X, GRID_CELL_Y } from '@/config/ui';

// Правило одно с saveField: ход либо помечен изменённым, либо стоит не по сетке.
export const isTurnGeometryUnsaved = (turn) =>
  Boolean(turn.wasChanged) ||
  turn.position.x % GRID_CELL_X !== 0 ||
  turn.position.y % GRID_CELL_X !== 0 ||
  turn.size.width % GRID_CELL_X !== 0 ||
  turn.size.height % GRID_CELL_Y !== 0;

// Восстановление сохранённой прокрутки само вызывает обработчик scroll, и запись
// о ней появляется на каждой загрузке: отправлять нечего, пока значение совпадает
// с уже сохранённым у виджета.
const isScrollUnsaved = (state, { turnId, widgetId, scrollPosition }) =>
  (state.turns.d[turnId]?.dWidgets?.[widgetId]?.scrollPosition || 0) !==
  scrollPosition;

export const selectFieldDirty = (state) => {
  const { g, scrollPositions } = state.turns;
  for (const key in scrollPositions) {
    if (isScrollUnsaved(state, scrollPositions[key])) return true;
  }
  for (const id in g) {
    if (isTurnGeometryUnsaved(g[id])) return true;
  }
  return false;
};

// Раскладка «частей и окна» — чистая арифметика без DOM и стора: упорядоченный список id частей,
// высота каждой (замеренная или оценённая), окно прокрутки с запасом → какие части рисовать,
// где они лежат и на сколько сдвинуть scrollTop, когда части выше окна сменили высоту.
// На ней стоят карточка перевода и предпросмотр формы; дальше — редактор рядов и блоки статьи.

// Запас отрисовки над и под окном — в высотах окна (экранах).
export const OVERSCAN_SCREENS = 1;

// Смещение каждой части от начала и общая высота.
export const layoutOffsets = (ids, heightOf) => {
  const tops = new Array(ids.length);
  let total = 0;
  for (let i = 0; i < ids.length; i += 1) {
    tops[i] = total;
    total += heightOf(ids[i]);
  }
  return { tops, total };
};

// Части, пересекающие окно [scrollTop − overscan, scrollTop + viewportHeight + overscan], плюс
// always (рисуются независимо от окна). Ответ — { visible: Set id, first, last } (индексы окна с
// запасом, −1 при пустом списке).
export const visibleParts = ({
  ids,
  heightOf,
  scrollTop,
  viewportHeight,
  overscan = viewportHeight * OVERSCAN_SCREENS,
  always,
}) => {
  const from = scrollTop - overscan;
  const to = scrollTop + viewportHeight + overscan;
  const visible = new Set();
  let first = -1;
  let last = -1;
  let top = 0;
  for (let i = 0; i < ids.length; i += 1) {
    const bottom = top + heightOf(ids[i]);
    if (bottom > from && top < to) {
      visible.add(ids[i]);
      if (first < 0) first = i;
      last = i;
    } else if (top >= to) {
      break;
    }
    top = bottom;
  }
  if (always) {
    const known = new Set(ids);
    for (const id of always) if (known.has(id)) visible.add(id);
  }
  return { visible, first, last };
};

// Сдвиг scrollTop, при котором содержимое под верхним краем окна остаётся на месте после того,
// как части целиком выше окна сменили высоту (оценка → замер, пересчёт оценок). Часть считается
// по прежним высотам: лежит выше края, если её низ не ниже scrollTop; часть под краем и всё ниже
// неё сдвига не дают.
export const scrollShift = ({ ids, before, after, scrollTop }) => {
  let top = 0;
  let shift = 0;
  for (let i = 0; i < ids.length; i += 1) {
    const was = before(ids[i]);
    if (top + was > scrollTop) break;
    shift += after(ids[i]) - was;
    top += was;
  }
  return shift;
};

// Части подряд в одном состоянии: { ids, visible }. Невидимый отрезок рисуется одним разделителем
// суммарной высоты — DOM и работа React не зависят от числа частей вне окна.
export const runs = (ids, visible) => {
  const result = [];
  let current = null;
  for (let i = 0; i < ids.length; i += 1) {
    const shown = visible.has(ids[i]);
    if (!current || current.visible !== shown) {
      current = { ids: [], visible: shown };
      result.push(current);
    }
    current.ids.push(ids[i]);
  }
  return result;
};

export const sumHeights = (ids, heightOf) => {
  let total = 0;
  for (let i = 0; i < ids.length; i += 1) total += heightOf(ids[i]);
  return total;
};

export const sameParts = (a, b) => {
  if (a === b) return true;
  if (!a || !b || a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
};

// Оценка высоты текстовой части до отрисовки: строк по длине текста и ширине колонки при средней
// ширине знака, умноженных на высоту строки, плюс постоянная добавка (отступы, рамка). Не меньше
// одной строки; дробная длина строки округляется вверх.
export const estimateTextHeight = ({
  chars,
  columnWidth,
  charWidth,
  lineHeight,
  extra = 0,
}) => {
  const perLine = Math.max(1, Math.floor(columnWidth / Math.max(1, charWidth)));
  const lines = Math.max(1, Math.ceil(chars / perLine));
  return lines * lineHeight + extra;
};

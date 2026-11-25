// Сжатый вид статьи и перевода — столбик окошек вокруг групп цитат, как у сжатого абзаца. Чистый
// модуль без импортов: ряды — по номерам, высоты и места выделений — числами (замер или оценка).
//
// Цитаты, между которыми по вертикали меньше 2 × FREE_SPACE, — одна группа; выделения одного ряда —
// всегда одна группа (ряд не режется). Окошко — ряды от середины промежутка с предыдущей группой до
// середины промежутка со следующей (граница — между рядами, ближайшая к середине); первое — от
// начала хода, последнее — до конца: окошки вместе содержат все ряды по одному разу. Высота окошка —
// FREE_SPACE над группой, группа и FREE_SPACE под ней (не больше, чем в окошке есть рядов), но не
// больше WINDOW_MAX; начальная прокрутка ставит группу по центру.

export const FREE_SPACE = 100;
export const WINDOW_MAX = 500;

// Смещения рядов от начала хода: offsets[i] — верх ряда i, offsets[count] — общая высота.
export const rowOffsets = (count, heightOf) => {
  const offsets = new Array(count + 1);
  offsets[0] = 0;
  for (let i = 0; i < count; i += 1) offsets[i + 1] = offsets[i] + heightOf(i);
  return offsets;
};

// quotes — [{ id, row, top, bottom }]: row — номер ряда, top и bottom — от верха своего ряда.
// Ответ — группы по порядку: { top, bottom — от начала хода; firstRow, lastRow; rows — номера рядов
// с выделениями; quotes — id }.
export const quoteGroups = (quotes, offsets, free = FREE_SPACE) => {
  const placed = quotes
    .map((quote) => ({
      id: quote.id,
      row: quote.row,
      top: offsets[quote.row] + quote.top,
      bottom: offsets[quote.row] + Math.max(quote.top, quote.bottom),
    }))
    .sort((a, b) => a.row - b.row || a.top - b.top || a.bottom - b.bottom);
  const groups = [];
  for (const quote of placed) {
    const last = groups[groups.length - 1];
    if (last && (quote.row === last.lastRow || quote.top - last.bottom < 2 * free)) {
      last.top = Math.min(last.top, quote.top);
      last.bottom = Math.max(last.bottom, quote.bottom);
      if (quote.row !== last.lastRow) last.rows.push(quote.row);
      last.lastRow = quote.row;
      last.quotes.push(quote.id);
    } else {
      groups.push({
        top: quote.top,
        bottom: quote.bottom,
        firstRow: quote.row,
        lastRow: quote.row,
        rows: [quote.row],
        quotes: [quote.id],
      });
    }
  }
  return groups;
};

// Граница между рядами, ближайшая к y: номер ряда из [from, to], чей верх ближе всех к y.
export const nearestBoundary = (offsets, y, from, to) => {
  let lo = from;
  let hi = to;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid] < y) lo = mid + 1;
    else hi = mid;
  }
  return lo > from && y - offsets[lo - 1] <= offsets[lo] - y ? lo - 1 : lo;
};

// count — число рядов; heightOf(i) — высота ряда; quotes — см. quoteGroups.
// Ответ — окошки по порядку: { from, to — номера первого и последнего ряда; height — высота окошка;
// content — высота его рядов; top, bottom — группа от верха содержимого окошка; scrollTop — начальная
// прокрутка (группа по центру); rows — номера рядов с выделениями; quotes — id выделений }.
export const quoteWindows = ({ count, heightOf, quotes, free = FREE_SPACE, max = WINDOW_MAX }) => {
  if (!count || !quotes?.length) return [];
  const offsets = rowOffsets(count, heightOf);
  const groups = quoteGroups(quotes, offsets, free);
  const starts = [0];
  for (let k = 1; k < groups.length; k += 1) {
    const middle = (groups[k - 1].bottom + groups[k].top) / 2;
    starts.push(nearestBoundary(offsets, middle, groups[k - 1].lastRow + 1, groups[k].firstRow));
  }
  return groups.map((group, k) => {
    const from = starts[k];
    const to = (k + 1 < groups.length ? starts[k + 1] : count) - 1;
    const content = offsets[to + 1] - offsets[from];
    const top = group.top - offsets[from];
    const bottom = group.bottom - offsets[from];
    const height = Math.max(
      1,
      Math.round(Math.min(max, Math.min(free, top) + (bottom - top) + Math.min(free, content - bottom))),
    );
    const scrollTop = Math.max(
      0,
      Math.min(Math.round(content - height), Math.round((top + bottom) / 2 - height / 2)),
    );
    return { from, to, height, content, top, bottom, scrollTop, rows: group.rows, quotes: group.quotes };
  });
};

// Множитель оценок высоты: медиана отношения «замер / оценка» по замеренным рядам без выделений
// (ряд с цитатой бывает нетипичным — список, таблица); таких нет — 1.
export const estimateScale = (measured, estimate) => {
  const ratios = [];
  for (const { row, height, marks } of measured) {
    const raw = estimate(row);
    if (!marks?.length && raw > 0 && height > 0) ratios.push(height / raw);
  }
  if (!ratios.length) return 1;
  ratios.sort((a, b) => a - b);
  const middle = ratios.length >> 1;
  const median = ratios.length % 2 ? ratios[middle] : (ratios[middle - 1] + ratios[middle]) / 2;
  return Math.min(4, Math.max(0.5, median));
};

// Окошки по замеру части рядов: measured — [{ row, height, marks: [{ id, top, bottom }] }] (ряды с
// выделениями — все; места выделений — от верха своего ряда), estimate(i) — оценка высоты остальных.
// Ответ — { windows, scale, total — сумма высот окошек }.
export const measuredWindows = ({ count, estimate, measured, free = FREE_SPACE, max = WINDOW_MAX }) => {
  const heights = new Map(measured.map((item) => [item.row, item.height]));
  const scale = estimateScale(measured, estimate);
  const heightOf = (i) =>
    heights.has(i) ? heights.get(i) : Math.max(1, Math.round(estimate(i) * scale));
  const quotes = [];
  for (const { row, marks } of measured) {
    for (const mark of marks || []) quotes.push({ id: mark.id, row, top: mark.top, bottom: mark.bottom });
  }
  const windows = quoteWindows({ count, heightOf, quotes, free, max });
  return { windows, scale, total: windows.reduce((sum, item) => sum + item.height, 0) };
};

// Ряды для замера перед раскладкой: quoteRows — номера рядов с выделениями. К ним — соседи сверху и
// снизу (поля окошка над и под группой) или, когда рядов с выделениями больше neighboursUpTo, samples
// рядов-образцов равномерно по ходу: по рядам без выделений калибруется оценка остальных.
export const rowsToMeasure = (count, quoteRows, { neighboursUpTo = 60, samples = 12 } = {}) => {
  const picked = new Set(quoteRows);
  if (quoteRows.length <= neighboursUpTo) {
    for (const row of quoteRows) {
      if (row > 0) picked.add(row - 1);
      if (row + 1 < count) picked.add(row + 1);
    }
  } else {
    for (let k = 0; k < samples; k += 1) {
      picked.add(Math.min(count - 1, Math.floor(((k + 0.5) * count) / samples)));
    }
  }
  return [...picked].sort((a, b) => a - b);
};

// Номер окошка, в котором лежит ряд row; -1 — такого нет.
export const windowOfRow = (windows, row) => {
  let lo = 0;
  let hi = windows.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (row < windows[mid].from) hi = mid - 1;
    else if (row > windows[mid].to) lo = mid + 1;
    else return mid;
  }
  return -1;
};

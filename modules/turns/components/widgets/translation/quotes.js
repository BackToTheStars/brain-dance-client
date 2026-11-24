// Цитаты хода «Перевод текста» — выделения ==…==^id в ячейках рядов. Список цитат нигде не
// хранится: он выводится из рядов. Чистый модуль; из соседей — только parseMarks ядра md.

import { parseMarks } from '../md/markdown';

const SIDES = ['left', 'right'];
const text = (value) => (typeof value === 'string' ? value : '');
const list = (rows) => (Array.isArray(rows) ? rows : []);

// Выше id вида «секунда + n» у цитат остальных типов: с ними новый id не совпадёт.
const MIN_ID = 1e12;
const randomId = (random) =>
  MIN_ID + Math.floor(random() * (Number.MAX_SAFE_INTEGER - MIN_ID));

// Цифра сразу за дописанным ^id прочиталась бы его частью: перед ней — невидимый разделитель, как в Visual.
const WORD_JOINER = String.fromCharCode(0x2060);
const joinedAt = (source, end) => (source[end] === WORD_JOINER ? 1 : 0);

// Выделения ряда, левая ячейка, затем правая: { id, side, text, idStart, end }. Считаются раз на
// объект ряда — нетронутый ряд после операции остаётся тем же объектом. id — число или null;
// хвост, который не читается обратно тем же числом (ведущие нули, не безопасное целое), — тоже null.
const marksCache = new WeakMap();
export const rowMarks = (row) => {
  if (!row || typeof row !== 'object') return [];
  let marks = marksCache.get(row);
  if (!marks) {
    marks = [];
    for (const side of SIDES) {
      const source = text(row[side]);
      for (const mark of parseMarks(source)) {
        const exact =
          mark.id !== null &&
          Number.isSafeInteger(mark.id) &&
          source.slice(mark.idStart + 1, mark.end) === String(mark.id);
        marks.push({
          id: exact ? mark.id : null,
          side,
          text: mark.text,
          idStart: mark.idStart,
          end: mark.end,
        });
      }
    }
    marksCache.set(row, marks);
  }
  return marks;
};

// Указатель цитат рядов, раз на массив рядов: count — выделений с id, byId — строка id →
// { index — номер ряда, side, text }; у повтора id — первое выделение по порядку.
const indexCache = new WeakMap();
const NO_INDEX = { count: 0, byId: new Map() };
export const rowsQuoteIndex = (rows) => {
  if (!Array.isArray(rows)) return NO_INDEX;
  let index = indexCache.get(rows);
  if (!index) {
    index = { count: 0, byId: new Map() };
    for (let i = 0; i < rows.length; i += 1) {
      for (const mark of rowMarks(rows[i])) {
        if (mark.id === null) continue;
        index.count += 1;
        const key = String(mark.id);
        if (!index.byId.has(key)) {
          index.byId.set(key, { index: i, side: mark.side, text: mark.text });
        }
      }
    }
    indexCache.set(rows, index);
  }
  return index;
};

// Цитаты с линиями в рядах, которых нет в DOM: [{ quoteId, text, position: 'top' | 'bottom' }] —
// выше первого отрисованного ряда или ниже. markers — маркеры линий хода, visible — Set id
// отрисованных рядов (пусто или нет — окно ещё не известно, записей нет).
// Пустой ответ — один и тот же массив: по нему вызывающий видит, что ничего не сменилось.
const NO_QUOTES = [];
export const edgeQuotes = (rows, markers, visible) => {
  if (!Array.isArray(rows) || !visible?.size) return NO_QUOTES;
  const { byId, count } = rowsQuoteIndex(rows);
  if (!count) return NO_QUOTES;
  let first = -1;
  const top = [];
  const bottom = [];
  for (const marker of markers || []) {
    const quote = byId.get(String(marker));
    if (!quote || visible.has(rows[quote.index].id)) continue;
    if (first < 0) first = rows.findIndex((row) => visible.has(row.id));
    const record = { quoteId: String(marker), text: quote.text };
    if (quote.index < first) top.push({ ...record, position: 'top' });
    else bottom.push({ ...record, position: 'bottom' });
  }
  return top.length || bottom.length ? [...top, ...bottom] : NO_QUOTES;
};

// Выделениям без id и повторам id дописывает новый id — случайное безопасное целое, не занятое
// ни в одном ряду формы и базы. Повтор: id остаётся за рядом, где он уже сохранён (base), иначе
// за первым выделением по порядку рядов. only — id ряда: меняется только он (сохранение одного
// ряда). unsaved — меняются только ряды, отличные от базы: иначе общий Save переписал бы весь ход.
// Нетронутый ряд — тот же объект, без правок — тот же массив.
export const ensureRowQuoteIds = (rows, base, { random = Math.random, only, unsaved = false } = {}) => {
  const current = list(rows);
  const saved = new Map(list(base).map((row) => [row.id, row]));
  const taken = new Set();
  for (const source of [saved.values(), current]) {
    for (const row of source) {
      for (const mark of rowMarks(row)) if (mark.id !== null) taken.add(mark.id);
    }
  }
  const owner = new Map();
  for (const row of current) {
    const was = saved.get(row.id);
    if (!was) continue;
    const own = was === row ? null : new Set(rowMarks(was).map((mark) => mark.id));
    for (const { id } of rowMarks(row)) {
      if (id !== null && (!own || own.has(id)) && !owner.has(id)) owner.set(id, row.id);
    }
  }
  const fresh = () => {
    let id;
    do id = randomId(random);
    while (taken.has(id));
    taken.add(id);
    return id;
  };

  const used = new Set();
  let changed = false;
  const result = current.map((row) => {
    const marks = rowMarks(row);
    const keep = marks.map(({ id }) => {
      if (id === null || used.has(id)) return false;
      if (owner.has(id) && owner.get(id) !== row.id) return false;
      used.add(id);
      return true;
    });
    if (!keep.includes(false) || (only !== undefined && row.id !== only)) return row;
    const was = saved.get(row.id);
    if (unsaved && was && text(was.left) === text(row.left) && text(was.right) === text(row.right)) return row;
    const next = { ...row };
    let at = 0;
    for (const side of SIDES) {
      const source = text(row[side]);
      let out = '';
      let cursor = 0;
      for (; at < marks.length && marks[at].side === side; at += 1) {
        if (keep[at]) continue;
        out += `${source.slice(cursor, marks[at].idStart)}^${fresh()}`;
        if (/\d/.test(source[marks[at].end] || '')) out += WORD_JOINER;
        cursor = marks[at].end;
      }
      if (cursor) next[side] = out + source.slice(cursor);
    }
    changed = true;
    return next;
  });
  return changed ? result : rows;
};

// Позиция курсора в ячейке side после того, как ряду дописали id: before и after — ряд до и после.
export const caretAfterIds = (before, after, side, position) => {
  const was = rowMarks(before).filter((mark) => mark.side === side);
  const now = rowMarks(after).filter((mark) => mark.side === side);
  const from = text(before?.[side]);
  const to = text(after?.[side]);
  let shift = 0;
  for (let i = 0; i < was.length && i < now.length; i += 1) {
    if (position <= was[i].idStart) break;
    if (position < was[i].end) return Math.min(position + shift, now[i].end);
    shift = now[i].end + joinedAt(to, now[i].end) - was[i].end - joinedAt(from, was[i].end);
  }
  return position + shift;
};

// id цитат, которые есть в рядах before и которых нет в рядах after.
export const lostRowQuotes = (before, after) => {
  const kept = rowsQuoteIndex(list(after)).byId;
  const lost = [];
  const seen = new Set();
  for (const row of list(before)) {
    for (const { id } of rowMarks(row)) {
      if (id === null || seen.has(id) || kept.has(String(id))) continue;
      seen.add(id);
      lost.push(id);
    }
  }
  return lost;
};

// Что уйдёт вместе с цитатами ids хода: ключи цитат, id линий на них и сводка для окна
// (цитата без линий не в счёт; summary null — предупреждать не о чем).
export const quoteLinks = (turnId, ids, lines) => {
  const keys = new Set(ids.map((id) => `${turnId}_${id}`));
  const linked = new Set();
  const lineIds = [];
  for (const line of keys.size ? lines || [] : []) {
    const ends = [
      `${line.sourceTurnId}_${line.sourceMarker}`,
      `${line.targetTurnId}_${line.targetMarker}`,
    ].filter((key) => keys.has(key));
    if (!ends.length) continue;
    ends.forEach((key) => linked.add(key));
    lineIds.push(line._id);
  }
  return {
    quoteKeys: [...keys],
    lineIds,
    summary: linked.size ? { quotesCount: linked.size, linesCount: lineIds.length } : null,
  };
};

// Ряды хода «Перевод текста»: { id, left, right } — id строкой на всё время жизни ряда,
// left / right — md-исходники ячеек (грамматика статьи md). Чистый модуль: карточка, форма и
// сохранение считают по нему одно и то же; из соседей — только toPlainText ядра md.

import { toPlainText } from '../md/markdown';

export const PREVIEW_TEXT_LIMIT = 2000;

const text = (value) => (typeof value === 'string' ? value : '');

// Уникальность нужна внутри одного хода: время плюс шесть случайных знаков (четырёх не хватало:
// две тысячи id в одну миллисекунду давали повтор).
export const newRowId = (now = Date.now(), random = Math.random) =>
  `${now.toString(36)}${Math.floor(random() * 36 ** 6)
    .toString(36)
    .padStart(6, '0')}`;

export const emptyRow = (id = newRowId()) => ({ id, left: '', right: '' });

// Хранимая форма рядов: только объекты, id — непустая строка без повторов (ряд без id или с
// повтором получает свежий), ячейки — строки. Не массив или пусто → [] (карточка такой ход не
// рисует); форме один пустой ряд даёт formRows.
export const normalizeRows = (rows) => {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  const result = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    let id = row.id == null ? '' : String(row.id);
    while (!id || seen.has(id)) id = newRowId();
    seen.add(id);
    result.push({ id, left: text(row.left), right: text(row.right) });
  }
  return result;
};

export const formRows = (rows) => {
  const normalized = normalizeRows(rows);
  return normalized.length ? normalized : [emptyRow()];
};

export const normalizeLanguages = (languages) => ({
  left: text(languages?.left).trim(),
  right: text(languages?.right).trim(),
});

const hasRowContent = (row) =>
  !!row && (text(row.left).trim() !== '' || text(row.right).trim() !== '');

export const hasRowsContent = (rows) => Array.isArray(rows) && rows.some(hasRowContent);

// Ряды формы к записи: хранимая форма без рядов, пустых с обеих сторон (ряд с одной пустой
// ячейкой — пробел перевода, он остаётся).
export const dropEmptyRows = (rows) => normalizeRows(rows).filter(hasRowContent);

// Производный paragraph хода — начало плоского текста левой колонки: ячейки через пустую
// строку, не длиннее limit; ряды за пределом не читаются.
export const rowsToPreviewText = (rows, limit = PREVIEW_TEXT_LIMIT) => {
  if (!Array.isArray(rows)) return '';
  const parts = [];
  let length = 0;
  for (const row of rows) {
    const part = toPlainText(text(row?.left));
    if (!part) continue;
    parts.push(part);
    length += part.length + 2;
    if (length >= limit) break;
  }
  return parts.join('\n\n').slice(0, limit);
};

// Что отправить серверу после правки (оба списка — в хранимой форме): в upsert только изменённые
// ячейки — у прежнего ряда изменённая сторона, новый ряд целиком; remove — снятые id; order — лишь
// если итоговый порядок отличается от «прежние без снятых, новые в конец» (так сервер кладёт ряды
// без order). null — изменений нет.
export const diffRows = (before, after) => {
  const prev = Array.isArray(before) ? before : [];
  const next = Array.isArray(after) ? after : [];
  const prevById = new Map(prev.map((row) => [row.id, row]));
  const nextIds = new Set(next.map((row) => row.id));

  const upsert = [];
  for (const row of next) {
    const old = prevById.get(row.id);
    if (!old) {
      upsert.push({ id: row.id, left: row.left, right: row.right });
      continue;
    }
    const change = { id: row.id };
    if (old.left !== row.left) change.left = row.left;
    if (old.right !== row.right) change.right = row.right;
    if ('left' in change || 'right' in change) upsert.push(change);
  }
  const remove = prev.filter((row) => !nextIds.has(row.id)).map((row) => row.id);

  const expected = [
    ...prev.filter((row) => nextIds.has(row.id)).map((row) => row.id),
    ...next.filter((row) => !prevById.has(row.id)).map((row) => row.id),
  ];
  const actual = next.map((row) => row.id);
  const reordered = expected.some((id, index) => id !== actual[index]);

  if (!upsert.length && !remove.length && !reordered) return null;
  const ops = { upsert, remove };
  if (reordered) ops.order = actual;
  return ops;
};

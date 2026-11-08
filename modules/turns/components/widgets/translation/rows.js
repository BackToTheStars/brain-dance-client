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
// рисует); форме один пустой ряд даёт formRows. Ряд уже в хранимой форме остаётся тем же
// объектом, список из одних таких — тем же массивом: по ним карточка и форма узнают нетронутое.
export const normalizeRows = (rows) => {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  const result = [];
  let same = true;
  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      same = false;
      continue;
    }
    let id = row.id == null ? '' : String(row.id);
    while (!id || seen.has(id)) id = newRowId();
    seen.add(id);
    const stored =
      id === row.id &&
      typeof row.left === 'string' &&
      typeof row.right === 'string' &&
      Object.keys(row).length === 3;
    if (!stored) same = false;
    result.push(stored ? row : { id, left: text(row.left), right: text(row.right) });
  }
  return same ? rows : result;
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

// Превью хода — плоский текст первой непустой левой ячейки; левая колонка пуста — первой
// непустой правой. Обрезка до limit — страховка от огромной ячейки.
export const rowsToPreviewText = (rows, limit = PREVIEW_TEXT_LIMIT) => {
  if (!Array.isArray(rows)) return '';
  for (const side of ['left', 'right']) {
    for (const row of rows) {
      const part = toPlainText(text(row?.[side]));
      if (part) return part.slice(0, limit);
    }
  }
  return '';
};

// Производный paragraph хода перевода: его читают превью лобби, окно хода, бот.
export const rowsToPreviewParagraph = (rows) => [{ insert: `${rowsToPreviewText(rows)}\n` }];

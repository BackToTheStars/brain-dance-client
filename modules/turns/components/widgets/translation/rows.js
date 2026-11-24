// Ряды хода «Перевод текста»: { id, left, right } — id строкой на всё время жизни ряда,
// left / right — md-исходники ячеек (грамматика статьи md). Чистый модуль: карточка, форма и
// сохранение считают по нему одно и то же; из соседей — только ядро md.

import { MD_RENDER_CONFIG, toPlainText } from '../md/markdown';

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

// Статья md хранится теми же рядами с одной колонкой: блок — ряд, left — исходник блока, right
// пустой. Склейка блоков через пустую строку — исходник статьи.
export const joinBlocks = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => text(row?.left)).join('\n\n');

// Превью статьи — начало плоского текста статьи, как до хранения блоками; склеиваются только
// первые блоки, пока плоского текста не наберётся на предел.
export const articlePreviewText = (rows, limit = PREVIEW_TEXT_LIMIT) => {
  const list = Array.isArray(rows) ? rows : [];
  let source = '';
  for (let i = 0; i < list.length; i += 1) {
    const part = text(list[i]?.left);
    if (!part.trim()) continue;
    source = source ? `${source}\n\n${part}` : part;
    if (source.length >= limit && toPlainText(source).length >= limit) break;
  }
  return toPlainText(source).slice(0, limit);
};

export const articlePreviewParagraph = (rows) => [{ insert: `${articlePreviewText(rows)}\n` }];

// Деление статьи на блоки — то же, что на сервере (миграция, создание из markdown): общие примеры
// в brain-platform/scripts/md-blocks/cases.json. Блок — блок верхнего уровня markdown-it с опциями
// рендера карточки; строки вне блоков (определения ссылок) — свой блок; пустые строки между
// блоками уходят. Блок больше limit байт UTF-8 делится: таблица — по строкам с шапкой, список — по
// пунктам, ограждённый код — по строкам с ограждением, код с отступом и цитата-блок — по строкам,
// прочее — по предложениям; выделение ==…==^id не разрезается.
export const BLOCK_LIMIT = 16 * 1024;

const utf8Bytes = (value) => {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x80) total += 1;
    else if (code < 0x800) total += 2;
    else if (code >= 0xd800 && code <= 0xdbff && (value.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      total += 4;
      i += 1;
    } else total += 3;
  }
  return total;
};

const HIGHLIGHT = /==(?:[^=\n]|=(?!=)|\n(?!\n))+?==(?:\^\d+)?/g;
const SENTENCE_END = /[.!?…]["')\]»]*[ \n]+/g;

// Свой экземпляр парсера на фабрику markdown-it: правила выделений на границы блоков не влияют.
const parsers = new WeakMap();
const parserOf = (markdownIt) => {
  let md = parsers.get(markdownIt);
  if (!md) {
    md = markdownIt(MD_RENDER_CONFIG.preset, MD_RENDER_CONFIG.options);
    if (MD_RENDER_CONFIG.disable?.length) md.disable(MD_RENDER_CONFIG.disable);
    parsers.set(markdownIt, md);
  }
  return md;
};

const trimBlank = (lines) => {
  let a = 0;
  let b = lines.length;
  while (a < b && lines[a].trim() === '') a += 1;
  while (b > a && lines[b - 1].trim() === '') b -= 1;
  return lines.slice(a, b);
};

const pushLoose = (lines, from, to, out) => {
  let start = null;
  for (let i = from; i <= to; i += 1) {
    const blank = i === to || lines[i].trim() === '';
    if (!blank && start === null) start = i;
    if (blank && start !== null) {
      out.push({ start, end: i, type: 'loose' });
      start = null;
    }
  }
};

const topBlocks = (lines, tokens) => {
  const out = [];
  let line = 0;
  for (const token of tokens) {
    if (token.level !== 0 || !token.map || token.nesting === -1) continue;
    const [start, end] = token.map;
    if (start > line) pushLoose(lines, line, start, out);
    out.push({ start, end, type: token.type });
    line = Math.max(line, end);
  }
  if (line < lines.length) pushLoose(lines, line, lines.length, out);
  return out
    .map((span) => ({ type: span.type, text: trimBlank(lines.slice(span.start, span.end)).join('\n') }))
    .filter((block) => block.text.trim() !== '');
};

// Жадно собирает куски не больше limit; кусок больше limit сам по себе — отдельной частью.
const pack = (pieces, limit, glue, wrap = (body) => body) => {
  const parts = [];
  let current = [];
  for (const piece of pieces) {
    const next = [...current, piece];
    if (current.length && utf8Bytes(wrap(next.join(glue))) > limit) {
      parts.push(wrap(current.join(glue)));
      current = [piece];
    } else current = next;
  }
  if (current.length) parts.push(wrap(current.join(glue)));
  return parts;
};

const splitTable = (source, limit) => {
  const lines = source.split('\n');
  const head = lines.slice(0, 2).join('\n');
  return pack(lines.slice(2), limit, '\n', (body) => `${head}\n${body}`);
};

const splitFence = (source, limit) => {
  const lines = source.split('\n');
  const open = lines[0];
  const closed = lines.length > 1 && /^\s*(`{3,}|~{3,})\s*$/.test(lines[lines.length - 1]);
  const close = closed ? lines[lines.length - 1] : open.match(/^\s*(`{3,}|~{3,})/)[1];
  const body = lines.slice(1, closed ? -1 : undefined);
  return pack(body, limit, '\n', (inner) => `${open}\n${inner}\n${close}`);
};

const topItems = (md, source) =>
  md.parse(source, {}).filter((token) => token.type === 'list_item_open' && token.level === 1);

const splitList = (md, source, limit, ordered) => {
  const items = topItems(md, source).map((token) => token.map);
  const lines = source.split('\n');
  const pieces = items.map(([start], i) =>
    trimBlank(lines.slice(start, i + 1 < items.length ? items[i + 1][0] : lines.length)).join('\n'),
  );
  const parts = pack(pieces, limit, /\n\s*\n/.test(source) ? '\n\n' : '\n');
  if (!ordered) return parts;
  let index = Number((lines[0].match(/^\s*(\d+)[.)]/) || [])[1] || 1);
  return parts.map((part) => {
    const renumbered = part.replace(/^(\s*)\d+([.)])/, `$1${index}$2`);
    index += topItems(md, part).length;
    return renumbered;
  });
};

const sentences = (source) => {
  const guarded = [];
  for (const match of source.matchAll(HIGHLIGHT)) guarded.push([match.index, match.index + match[0].length]);
  const inside = (pos) => guarded.some(([a, b]) => pos > a && pos < b);
  const pieces = [];
  let start = 0;
  for (const match of source.matchAll(SENTENCE_END)) {
    const cut = match.index + match[0].length;
    if (inside(cut)) continue;
    pieces.push(source.slice(start, cut));
    start = cut;
  }
  if (start < source.length) pieces.push(source.slice(start));
  return pieces.filter((piece) => piece !== '');
};

const splitLarge = (md, block, limit) => {
  if (utf8Bytes(block.text) <= limit) return [block.text];
  switch (block.type) {
    case 'table_open':
      return splitTable(block.text, limit);
    case 'fence':
      return splitFence(block.text, limit);
    case 'bullet_list_open':
      return splitList(md, block.text, limit, false);
    case 'ordered_list_open':
      return splitList(md, block.text, limit, true);
    case 'code_block':
    case 'blockquote_open':
    case 'loose':
      return pack(block.text.split('\n'), limit, '\n');
    default:
      return pack(sentences(block.text), limit, '').map((part) => part.trim());
  }
};

// Исходник → тексты блоков. markdownIt — фабрика markdown-it (грузится лениво, как рендер).
export const splitBlocks = (source, { markdownIt, limit = BLOCK_LIMIT }) => {
  const md = parserOf(markdownIt);
  const normalized = text(source).replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  return topBlocks(lines, md.parse(normalized, {})).flatMap((block) => splitLarge(md, block, limit));
};

// Ряды статьи из исходника (статья, ещё не разделённая на сервере).
export const rowsFromMarkdown = (source, markdownIt, idOf = newRowId) =>
  splitBlocks(source, { markdownIt }).map((left) => ({ id: idOf(), left, right: '' }));

// Блоки, которые при сохранении становятся несколькими: изменённый ряд (другой текст, чем в
// base, или ряда там нет; only — только этот ряд), чей текст делится на несколько блоков.
// Первая часть остаётся рядом с его id, остальные — новые ряды сразу за ним. { rows, parts } —
// ряды формы после деления (без деления — тот же массив) и сколько блоков получилось из
// разделённых рядов (0 — делить было нечего).
export const splitDraftRows = (rows, base, markdownIt, { only, limit = BLOCK_LIMIT } = {}) => {
  const list = Array.isArray(rows) ? rows : [];
  if (!markdownIt) return { rows, parts: 0 };
  const saved = new Map((Array.isArray(base) ? base : []).map((row) => [row.id, row]));
  let parts = 0;
  const result = [];
  for (const row of list) {
    const was = saved.get(row.id);
    const candidate =
      only !== undefined ? row.id === only : !was || text(was.left) !== text(row.left);
    const blocks =
      candidate && (text(row.left).includes('\n') || utf8Bytes(text(row.left)) > limit)
        ? splitBlocks(row.left, { markdownIt, limit })
        : null;
    if (!candidate || !blocks || blocks.length < 2) {
      result.push(row);
      continue;
    }
    parts += blocks.length;
    result.push({ ...row, left: blocks[0] });
    for (const left of blocks.slice(1)) result.push({ id: newRowId(), left, right: '' });
  }
  return parts ? { rows: result, parts } : { rows, parts: 0 };
};

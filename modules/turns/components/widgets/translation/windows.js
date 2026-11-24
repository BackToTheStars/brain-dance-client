// Сжатый вид статьи и перевода — окошки вокруг цитат, как у сжатого абзаца, но из исходника md, без
// замеров. Чистый модуль; из соседей — rowMarks и parseMarks, markdown-it — параметром.
//
// quoteWindows(rows, { md, single, context }) → [{ id, rowId, left, right, whole }]: окошки по порядку,
// ряд-подобные — их рисует та же сетка, что ряды. У перевода окошко — ряд с выделением целиком (обе
// колонки). У статьи — кусок абзаца-блока вокруг выделений: ± context знаков, начало и конец — по
// границе предложения или слова, не внутри кода, ссылки, выделения или выделения-цитаты; соседние
// выделения ближе 2 × context — одним куском; обрезанный край помечен «…». Таблица, список, код,
// цитата-блок и заголовок с выделением, а также кусок, после обрезки которого разметка ломается
// (лишние литеральные *, `, [, ==), — блок целиком. whole — окошко равно ряду (id = id ряда);
// у куска id — id ряда с номером после WINDOW_PART. Каждое выделение — ровно в одном окошке.

import { parseMarks } from '../md/markdown';
import { rowMarks } from './quotes';

const list = (rows) => (Array.isArray(rows) ? rows : []);
const text = (value) => (typeof value === 'string' ? value : '');

export const WINDOW_PART = '\u2060';
export const DEFAULT_CONTEXT = 160;
const ELLIPSIS = '\u2026';

// Обрезка, оставляющая меньше этой доли блока, не стоит окошка: блок целиком.
const MIN_CUT_SHARE = 0.15;

// Места, внутри которых резать нельзя: код в строке, ссылки и картинки, автоссылки, URL, теги,
// жирный, курсив, зачёркивание.
const PROTECTED = [
  /(`+)[\s\S]*?\1/g,
  /!?\[[^\]\n]*\](?:\([^)\n]*\)|\[[^\]\n]*\])?/g,
  /<[^>\s]+>/g,
  /https?:\/\/\S+/g,
  /(\*\*|__)(?=\S)[\s\S]*?\S\1/g,
  /(\*|_)(?=\S)[\s\S]*?\S\1/g,
  /~~(?=\S)[\s\S]*?\S~~/g,
];

const protectedSpans = (source, marks) => {
  const spans = marks.map((mark) => [mark.start, mark.end]);
  for (const re of PROTECTED) {
    re.lastIndex = 0;
    for (let m = re.exec(source); m; m = re.exec(source)) {
      if (m[0].length > 1) spans.push([m.index, m.index + m[0].length]);
      if (!m[0].length) re.lastIndex += 1;
    }
  }
  return spans;
};

const insideSpan = (spans, at) => spans.some(([from, to]) => at > from && at < to);

// Литеральные знаки разметки в тексте после разбора: у куска их не должно стать больше, чем у блока.
const LITERAL = /[*_`[\]]|==|~~/g;
const literals = (tokens) => {
  let count = 0;
  for (const token of tokens) {
    for (const child of token.children || []) {
      if (child.type === 'text') count += (child.content.match(LITERAL) || []).length;
    }
  }
  return count;
};

const isParagraph = (tokens) =>
  tokens.length === 3 &&
  tokens[0].type === 'paragraph_open' &&
  tokens[1].type === 'inline' &&
  tokens[2].type === 'paragraph_close';

// Начало куска: первая граница предложения, затем слова, в [from, limit]; не нашлось — ближайшая
// граница слова левее from; нет и её — начало блока.
const SENTENCE_END = /[.!?\u2026]["'\u00bb\u201d)\]]*\s+/g;
const startAt = (source, from, limit, spans) => {
  if (from <= 0) return 0;
  SENTENCE_END.lastIndex = from;
  for (let m = SENTENCE_END.exec(source); m && m.index + m[0].length <= limit; m = SENTENCE_END.exec(source)) {
    const at = m.index + m[0].length;
    if (at >= from && !insideSpan(spans, at)) return at;
  }
  for (let at = from; at <= limit; at += 1) {
    if (/\s/.test(source[at - 1]) && !/\s/.test(source[at]) && !insideSpan(spans, at)) return at;
  }
  for (let at = from - 1; at > 0; at -= 1) {
    if (/\s/.test(source[at - 1]) && !/\s/.test(source[at]) && !insideSpan(spans, at)) return at;
  }
  return 0;
};

// Конец куска: последняя граница предложения, затем слова, в [limit, to]; не нашлось — ближайшая
// граница слова правее to; нет и её — конец блока.
const endAt = (source, limit, to, spans) => {
  if (to >= source.length) return source.length;
  let best = -1;
  SENTENCE_END.lastIndex = limit;
  for (let m = SENTENCE_END.exec(source); m && m.index < to; m = SENTENCE_END.exec(source)) {
    const at = m.index + m[0].length - (m[0].length - m[0].trimEnd().length);
    if (at >= limit && at <= to && !insideSpan(spans, at)) best = at;
  }
  if (best >= 0) return best;
  for (let at = to; at >= limit; at -= 1) {
    if (!/\s/.test(source[at - 1] || ' ') && /\s/.test(source[at] || ' ') && !insideSpan(spans, at)) return at;
  }
  for (let at = to + 1; at < source.length; at += 1) {
    if (!/\s/.test(source[at - 1]) && /\s/.test(source[at]) && !insideSpan(spans, at)) return at;
  }
  return source.length;
};

// Куски блока статьи: [[start, end], …] по исходнику или null — блок целиком.
export const blockPieces = (source, md, context = DEFAULT_CONTEXT) => {
  const marks = parseMarks(source);
  if (!marks.length) return null;
  const tokens = md.parse(source, {});
  if (!isParagraph(tokens)) return null;
  const spans = protectedSpans(source, marks);
  const groups = [];
  for (const mark of marks) {
    const last = groups[groups.length - 1];
    if (last && mark.start - last.to <= 2 * context) last.to = mark.end;
    else groups.push({ from: mark.start, to: mark.end });
  }
  const pieces = [];
  for (const group of groups) {
    const start = startAt(source, group.from - context, group.from, spans);
    const end = endAt(source, group.to, group.to + context, spans);
    const prev = pieces[pieces.length - 1];
    if (prev && start <= prev[1]) prev[1] = Math.max(prev[1], end);
    else pieces.push([start, end]);
  }
  const kept = pieces.reduce((sum, [start, end]) => sum + end - start, 0);
  if (kept >= source.length * (1 - MIN_CUT_SHARE)) return null;
  const allowed = literals(tokens);
  for (const [start, end] of pieces) {
    const piece = source.slice(start, end);
    const parsed = md.parse(piece, {});
    if (!isParagraph(parsed) || literals(parsed) > allowed) return null;
  }
  return pieces;
};

const pieceSource = (source, [start, end]) =>
  `${start > 0 ? `${ELLIPSIS} ` : ''}${source.slice(start, end).trim()}${end < source.length ? ` ${ELLIPSIS}` : ''}`;

export const quoteWindows = (rows, { md, single = false, context = DEFAULT_CONTEXT } = {}) => {
  const windows = [];
  for (const row of list(rows)) {
    if (!rowMarks(row).length) continue;
    const source = text(row.left);
    const pieces = single && md ? blockPieces(source, md, context) : null;
    if (!pieces) {
      windows.push({ ...row, rowId: row.id, whole: true });
      continue;
    }
    pieces.forEach((range, k) =>
      windows.push({
        id: `${row.id}${WINDOW_PART}${k + 1}`,
        rowId: row.id,
        left: pieceSource(source, range),
        right: '',
        whole: false,
      }),
    );
  }
  return windows;
};

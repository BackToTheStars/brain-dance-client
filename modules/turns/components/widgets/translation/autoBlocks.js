// Правила режима «Авто» статьи: блок делится, как только правка сделала из него несколько блоков md
// (то же деление, что на Save, — splitBlocks), и склеивается с соседом по Backspace / Delete на краю.
// Чистый модуль: на входе тексты блоков и позиция курсора в исходнике, на выходе — тексты частей и курсор.

import { BLOCK_LIMIT, splitBlocks, utf8Bytes } from './rows';

const text = (value) => (typeof value === 'string' ? value : '');
// пустые строки в конце и в начале текста
const BLANK_TAIL = /(?:\n[ \t]*)+$/;
const BLANK_HEAD = /^(?:[ \t]*\n)+/;
const BLANK_LINE_END = /\n[ \t]*\n[ \t]*$/;
// знак, которым пробуется «следующая строка»: начнёт ли она новый блок
const PROBE = 'x';
const WORD_JOINER = String.fromCharCode(0x2060);
const QUOTE_ID_END = /==\^\d+$/;

const lineOf = (source, offset) => {
  let line = 0;
  for (let i = source.indexOf('\n'); i >= 0 && i < offset; i = source.indexOf('\n', i + 1)) line += 1;
  return line;
};

const result = (parts, part, caret, { keep = 0, moved = false } = {}) => {
  const target = parts[part];
  return {
    parts,
    keep,
    part,
    caret,
    line: lineOf(target, caret),
    column: caret - (target.lastIndexOf('\n', caret - 1) + 1),
    moved,
  };
};

// Курсор в частях: части — подстроки исходника по порядку; курсор в пустых строках между частями —
// в начало следующей части. Части после деления по пределу — не подстроки (шапка таблицы, ограждение
// кода): тогда курсор ищется по тексту перед ним.
const locate = (source, caret, parts, kind) => {
  const starts = [];
  let from = 0;
  for (const part of parts) {
    const at = source.indexOf(part, from);
    if (at < 0) break;
    starts.push(at);
    from = at + part.length;
  }
  if (starts.length === parts.length) {
    for (let k = 0; k < parts.length; k += 1) {
      const end = starts[k] + parts[k].length;
      if (caret > end) continue;
      if (caret >= starts[k]) return result(parts, k, caret - starts[k]);
      return result(parts, k, 0, { moved: true });
    }
    const last = parts.length - 1;
    const gap = source.slice(starts[last] + parts[last].length, caret);
    if (kind === 'leave' || (kind === 'enter' && /\n[ \t]*\n/.test(gap))) {
      return result([...parts, ''], parts.length, 0);
    }
    return result(parts, last, parts[last].length, { moved: true });
  }
  const context = source.slice(Math.max(0, caret - 24), caret);
  if (!context) return result(parts, 0, 0, { moved: true });
  for (let k = 0; k < parts.length; k += 1) {
    const at = parts[k].indexOf(context);
    if (at >= 0) return result(parts, k, at + context.length, { moved: true });
  }
  const last = parts.length - 1;
  return result(parts, last, parts[last].length, { moved: true });
};

// Блок после правки → null (делить нечего) или { parts, keep, part, caret, line, column, moved }:
// parts — тексты блоков по порядку; keep — индекс части, которая остаётся рядом с id блока (у
// остальных — новые id); part / caret — часть с курсором и позиция в ней; line / column — строка и
// знак курсора в этой части; moved — курсор встал не на свой знак (был в ушедшей пустой строке).
// kind — вид правки: 'type' — любая; 'enter' — вставлен перенос строки; 'leave' — строка с курсором
// вышла из списка, цитаты или кода (Visual) или опустевший пункт списка снят (Source).
// Деление: блок стал несколькими блоками md (пустая строка между абзацами, начало заголовка, выход из
// списка или кода, больше limit байт). Enter на пустой последней строке (второй Enter в конце), Enter
// в пустом блоке и Enter после строки, за которой текст начал бы новый блок (заголовок, закрытый код), —
// новый пустой блок ниже с курсором в нём. Второй Enter в начале блока — пустой блок выше.
export const autoSplit = (source, caret, { markdownIt, kind = 'type', limit = BLOCK_LIMIT } = {}) => {
  if (!markdownIt) return null;
  const value = text(source);
  const at = Math.max(0, Math.min(Number.isFinite(caret) ? caret : value.length, value.length));
  if (value.includes('\n') || utf8Bytes(value) > limit) {
    const blocks = splitBlocks(value, { markdownIt, limit });
    if (blocks.length >= 2) return locate(value, at, blocks, kind);
  }
  if (kind !== 'enter' && kind !== 'leave') return null;
  const head = value.slice(0, at);
  const tail = value.slice(at);
  if (tail.trim() === '' && (head.endsWith('\n') || kind === 'leave')) {
    const first = head.replace(BLANK_TAIL, '');
    // пустая строка внутри незакрытого ограждённого кода — часть кода: текст за ней блока не начнёт
    const opens =
      kind === 'leave' ||
      first.trim() === '' ||
      (BLANK_LINE_END.test(head) && splitBlocks(`${first}\n\n${PROBE}`, { markdownIt, limit }).length >= 2) ||
      splitBlocks(`${first}\n${PROBE}`, { markdownIt, limit }).length >= 2;
    if (opens) return result([first.trim() === '' ? '' : first, ''], 1, 0);
    return null;
  }
  if (kind === 'enter' && head.trim() === '' && BLANK_LINE_END.test(head) && tail.trim() !== '') {
    return result(['', tail.replace(BLANK_HEAD, '')], 1, 0, { keep: 1 });
  }
  return null;
};

// Склейка верхнего блока с нижним (Backspace в начале нижнего, Delete в конце верхнего): тексты
// соединяются без разделителя, курсор — в месте стыка, id остаётся у верхнего. Пустой блок просто
// уходит: keep — 'upper' или 'lower', чей id и текст остаются. null — итог больше limit байт.
export const autoMerge = (upper, lower, { limit = BLOCK_LIMIT } = {}) => {
  const top = text(upper);
  const bottom = text(lower);
  if (bottom.trim() === '') return { text: top, caret: top.length, keep: 'upper' };
  if (top.trim() === '') return { text: bottom, caret: 0, keep: 'lower' };
  // цифры сразу за ==…==^id прочитались бы частью id: на стыке — невидимый разделитель, курсор за ним
  const gap = QUOTE_ID_END.test(top) && /^\d/.test(bottom) ? WORD_JOINER : '';
  const joined = top + gap + bottom;
  if (utf8Bytes(joined) > limit) return null;
  return { text: joined, caret: top.length + gap.length, keep: 'upper' };
};

const LIST_ITEM = /^([ \t]*)(?:([-*+])|(\d{1,9})([.)]))([ \t]+)(.*)$/;

// Enter в пункте списка исходника (Source): null — не пункт или есть выделение; иначе замена
// диапазона [from, to) на insert, text / caret — итог. kind 'item' — новый пункт с тем же маркером
// (номер — следующий); 'leave' — пункт был пуст: маркер снимается, строка остаётся пустой.
export const listEnter = (source, start, end = start) => {
  const value = text(source);
  if (start !== end) return null;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const next = value.indexOf('\n', start);
  const lineEnd = next < 0 ? value.length : next;
  const match = LIST_ITEM.exec(value.slice(lineStart, lineEnd));
  if (!match) return null;
  const [, indent, bullet, number, delimiter, space, content] = match;
  const marker = indent.length + (bullet ? 1 : number.length + 1) + space.length;
  if (start < lineStart + marker) return null;
  if (content.trim() === '') {
    return {
      from: lineStart,
      to: lineEnd,
      insert: '',
      text: value.slice(0, lineStart) + value.slice(lineEnd),
      caret: lineStart,
      kind: 'leave',
    };
  }
  const insert = `\n${indent}${bullet || `${Number(number) + 1}${delimiter}`} `;
  return {
    from: start,
    to: start,
    insert,
    text: value.slice(0, start) + insert + value.slice(start),
    caret: start + insert.length,
    kind: 'item',
  };
};

// Мост исходника статьи и дельты Quill: строка исходника ↔ строка редактора, подмножество
// разметки — заголовки, списки одного уровня, цитата-блок, блок кода, жирный, курсив,
// зачёркивание, код в строке, ссылка, выделение ==…==^id. Остальное — в unsupported,
// такой исходник правится только как текст. markdown-it приходит параметром, как в ядре.

import { MD_COLORS, MD_DEFAULT_COLOR, MD_RENDER_CONFIG, markRule } from './markdown';
import { COLOR_CELLS, cellFromBackground } from './markColors';

export const UNSUPPORTED = {
  table: 'table',
  image: 'image',
  html: 'html',
  entity: 'entity',
  hr: 'hr',
  nestedList: 'nestedList',
  listBlocks: 'listBlocks',
  listStart: 'listStart',
  quoteBlocks: 'quoteBlocks',
  footnote: 'footnote',
  linkDefinition: 'linkDefinition',
  autolink: 'autolink',
  linkTitle: 'linkTitle',
};

const parsers = new WeakMap();

// Свой экземпляр: html включён только чтобы найти сырой HTML (карточка его экранирует),
// картинки — чтобы найти их, text_join выключен — экранирование отличается от сущности,
// адрес ссылки — как набран (иначе кириллица вернулась бы процентами).
const getParser = (markdownIt) => {
  let md = parsers.get(markdownIt);
  if (!md) {
    md = markdownIt(MD_RENDER_CONFIG.preset, { ...MD_RENDER_CONFIG.options, html: true });
    md.disable('text_join');
    md.normalizeLink = (url) => url;
    md.normalizeLinkText = (url) => url;
    md.inline.ruler.before('emphasis', 'mark', markRule);
    parsers.set(markdownIt, md);
  }
  return md;
};

const QUOTE_LINE = /^ {0,3}>/;
const CODE_PLAIN = 'plain';
// linkify берёт адрес из исходника как есть, с обратными косыми экранирования
const unescape = (text) => text.replace(/\\([!-/:-@[-`{-~])/g, '$1');

const pushOp = (ops, insert, attributes) => {
  if (!insert) return;
  const attrs = attributes && Object.keys(attributes).length ? attributes : null;
  const last = ops[ops.length - 1];
  if (
    last &&
    typeof last.insert === 'string' &&
    !last.insert.endsWith('\n') &&
    JSON.stringify(last.attributes || null) === JSON.stringify(attrs)
  ) {
    last.insert += insert;
    return;
  }
  ops.push(attrs ? { insert, attributes: attrs } : { insert });
};

const sortedAttrs = (attrs) =>
  Object.fromEntries(Object.keys(attrs).sort().map((key) => [key, attrs[key]]));

// linkify может остановиться между косой экранирования и самим символом: косая остаётся
// в адресе, символ — в тексте за ним.
const splitEscape = (children, k) =>
  children[k + 1]?.type === 'link_close' &&
  children[k + 2]?.type === 'text' &&
  /^[!-/:-@[-`{-~]/.test(children[k + 2].content) &&
  /(^|[^\\])(\\\\)*\\$/.test(children[k].content);

// Инлайновые токены блока → строки [[{ text, attrs }]]: каждый перевод строки — новая строка.
const inlineLines = (inline, unsupported) => {
  const lines = [[]];
  const state = { bold: 0, italic: 0, strike: 0, link: null, mark: null };
  const current = () => {
    const attrs = {};
    if (state.bold) attrs.bold = true;
    if (state.italic) attrs.italic = true;
    if (state.strike) attrs.strike = true;
    if (state.link) attrs.link = state.link;
    if (state.mark) Object.assign(attrs, state.mark);
    return attrs;
  };
  const text = (content, extra) =>
    lines[lines.length - 1].push({ text: content, attrs: sortedAttrs({ ...current(), ...extra }) });
  const links = [];
  let linkify = false;
  const children = inline.children || [];
  children.forEach((token, k) => {
    switch (token.type) {
      case 'text':
        if (/\[\^[^\]\s]*\]/.test(token.content)) unsupported.add(UNSUPPORTED.footnote);
        if (!linkify) text(token.content);
        else text(unescape(splitEscape(children, k) ? token.content.slice(0, -1) : token.content));
        break;
      case 'text_special':
        if (token.info === 'entity') unsupported.add(UNSUPPORTED.entity);
        text(token.content);
        break;
      case 'softbreak':
      case 'hardbreak':
        lines.push([]);
        break;
      case 'code_inline':
        text(token.content, { code: true });
        break;
      case 'strong_open':
        state.bold += 1;
        break;
      case 'strong_close':
        state.bold -= 1;
        break;
      case 'em_open':
        state.italic += 1;
        break;
      case 'em_close':
        state.italic -= 1;
        break;
      case 's_open':
        state.strike += 1;
        break;
      case 's_close':
        state.strike -= 1;
        break;
      case 'link_open': {
        if (token.markup === 'autolink') unsupported.add(UNSUPPORTED.autolink);
        if (token.attrGet('title') !== null) unsupported.add(UNSUPPORTED.linkTitle);
        // ссылка linkify — это просто адрес в тексте, карточка соберёт её сама
        linkify = token.markup === 'linkify';
        const href = linkify ? null : token.attrGet('href');
        links.push(state.link);
        state.link = href;
        break;
      }
      case 'link_close':
        linkify = false;
        state.link = links.pop() ?? null;
        break;
      case 'mark_open': {
        const color = token.attrGet('data-color');
        const id = token.attrGet('data-id');
        state.mark = {
          background: COLOR_CELLS[color]?.hex || COLOR_CELLS[MD_DEFAULT_COLOR].hex,
          ...(id !== null ? { id } : {}),
        };
        break;
      }
      case 'mark_close':
        state.mark = null;
        break;
      case 'mark_id':
        break;
      case 'image':
        unsupported.add(UNSUPPORTED.image);
        break;
      case 'html_inline':
        unsupported.add(UNSUPPORTED.html);
        break;
      default:
        break;
    }
  });
  return lines;
};

// Исходник → { ops, unsupported }. ops строятся, только если unsupported пуст.
export const markdownToDelta = (source, { markdownIt }) => {
  const md = getParser(markdownIt);
  const src = (source || '').replace(/\r\n?/g, '\n');
  const srcLines = src.split('\n');
  const env = {};
  const tokens = md.parse(src, env);
  const unsupported = new Set();
  for (const label of Object.keys(env.references || {})) {
    unsupported.add(label.startsWith('^') ? UNSUPPORTED.footnote : UNSUPPORTED.linkDefinition);
  }

  // Строка исходника → { block, segments }; строки без записи — пустые.
  const rows = new Array(srcLines.length).fill(null);
  const setRows = (startLine, inline, blockOf) => {
    inlineLines(inline, unsupported).forEach((segments, k) => {
      const line = startLine + k;
      rows[line] = { block: blockOf(line, k), segments };
    });
  };

  const depth = { list: 0, quote: 0 };
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    switch (token.type) {
      case 'paragraph_open': {
        if (depth.list) break;
        const inline = tokens[i + 1];
        const quoted = depth.quote > 0;
        setRows(token.map[0], inline, (line) =>
          quoted && QUOTE_LINE.test(srcLines[line]) ? { blockquote: true } : {},
        );
        break;
      }
      case 'heading_open': {
        if (depth.list || depth.quote) {
          unsupported.add(depth.list ? UNSUPPORTED.listBlocks : UNSUPPORTED.quoteBlocks);
          break;
        }
        const header = Number(token.tag.slice(1));
        setRows(token.map[0], tokens[i + 1], () => ({ header }));
        break;
      }
      case 'blockquote_open':
        if (depth.list || depth.quote) unsupported.add(depth.list ? UNSUPPORTED.listBlocks : UNSUPPORTED.quoteBlocks);
        depth.quote += 1;
        for (let line = token.map[0]; line < token.map[1]; line += 1) {
          if (QUOTE_LINE.test(srcLines[line])) rows[line] = { block: { blockquote: true }, segments: [] };
        }
        break;
      case 'blockquote_close':
        depth.quote -= 1;
        break;
      case 'bullet_list_open':
      case 'ordered_list_open':
        if (depth.list) unsupported.add(UNSUPPORTED.nestedList);
        else if (depth.quote) unsupported.add(UNSUPPORTED.quoteBlocks);
        if (token.attrGet('start') !== null) unsupported.add(UNSUPPORTED.listStart);
        depth.list += 1;
        break;
      case 'bullet_list_close':
      case 'ordered_list_close':
        depth.list -= 1;
        break;
      case 'list_item_open': {
        if (depth.list > 1) break;
        const list = /[.)]$/.test(token.markup) ? 'ordered' : 'bullet';
        const itemLine = token.map[0];
        rows[itemLine] = { block: { list }, segments: [] };
        // у пункта — один абзац с первой строки или ничего
        let j = i + 1;
        if (tokens[j].type === 'paragraph_open') {
          if (tokens[j].map[0] !== itemLine) unsupported.add(UNSUPPORTED.listBlocks);
          setRows(tokens[j].map[0], tokens[j + 1], (line) =>
            line === itemLine ? { list } : {},
          );
          j += 3;
        }
        if (tokens[j].type !== 'list_item_close') {
          unsupported.add(
            /_list_open$/.test(tokens[j].type) ? UNSUPPORTED.nestedList : UNSUPPORTED.listBlocks,
          );
        }
        break;
      }
      case 'fence':
      case 'code_block': {
        if (depth.list || depth.quote) {
          unsupported.add(depth.list ? UNSUPPORTED.listBlocks : UNSUPPORTED.quoteBlocks);
          break;
        }
        const codeLines = token.content.replace(/\n$/, '').split('\n');
        const first = token.map[0] + (token.type === 'fence' ? 1 : 0);
        for (let line = token.map[0]; line < token.map[1]; line += 1) rows[line] = { skip: true };
        if (token.content === '' && token.type === 'fence') break;
        // язык блока Quill хранит сам (data-language), без языка — plain, как он и отдаёт
        const language = (token.type === 'fence' && token.info.trim()) || CODE_PLAIN;
        codeLines.forEach((text, k) => {
          rows[first + k] = {
            block: { 'code-block': language },
            segments: text ? [{ text, attrs: {} }] : [],
          };
        });
        break;
      }
      case 'hr':
        unsupported.add(UNSUPPORTED.hr);
        break;
      case 'table_open':
        unsupported.add(UNSUPPORTED.table);
        break;
      case 'html_block':
        unsupported.add(UNSUPPORTED.html);
        break;
      default:
        break;
    }
    // строки подчёркивания заголовка-сетекста в редакторе не нужны
    if (token.type === 'heading_open' && /^[=-]/.test(token.markup)) {
      rows[token.map[1] - 1] = { skip: true };
    }
  }

  const reasons = [...unsupported];
  if (reasons.length) return { ops: [], unsupported: reasons };

  const ops = [];
  rows.forEach((row) => {
    if (row?.skip) return;
    for (const { text, attrs } of row?.segments || []) pushOp(ops, text, attrs);
    const block = row?.block && Object.keys(row.block).length ? row.block : null;
    ops.push(block ? { insert: '\n', attributes: block } : { insert: '\n' });
  });
  return { ops, unsupported: [] };
};

// ---------- дельта → исходник ----------

const isWhiteSpace = (code) =>
  (code >= 0x2000 && code <= 0x200a) ||
  [0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20, 0xa0, 0x1680, 0x202f, 0x205f, 0x3000].includes(code);
const PUNCT = /[\p{P}\p{S}]/u;
const isPunct = (code) => PUNCT.test(String.fromCodePoint(code));
const ASCII_PUNCT = /[!-/:-@[-`{-~]/;
const isWordChar = (ch) => ch !== undefined && !isWhiteSpace(ch.codePointAt(0)) && !isPunct(ch.codePointAt(0));

// Символы, которые в тексте стали бы разметкой. Соседи — в пределах куска с одним
// набором форматов: на краю куска может стоять разделитель, поэтому край экранируется.
const escapeText = (text, inLink) => {
  const chars = [...text];
  let out = '';
  chars.forEach((ch, i) => {
    const prev = chars[i - 1];
    const next = chars[i + 1];
    let escape = false;
    switch (ch) {
      case '\\':
        escape = next === undefined || ASCII_PUNCT.test(next);
        break;
      case '*':
      case '`':
      case '[':
      case '|':
        escape = true;
        break;
      case ']':
        // без неэкранированной [ закрывать нечего, кроме подписи ссылки
        escape = inLink;
        break;
      case '_':
        escape = !(isWordChar(prev) && isWordChar(next));
        break;
      case '~':
      case '=':
        escape = prev === undefined || next === undefined || prev === ch || next === ch;
        break;
      case '<':
        escape = next === undefined || /[A-Za-z/!?]/.test(next);
        break;
      case '&':
        escape = /^&#?[A-Za-z0-9]+;/.test(chars.slice(i).join(''));
        break;
      case '^':
        escape = i === 0 && /\d/.test(next || '');
        break;
      case '!':
        // ![ стало бы картинкой, если сразу за текстом откроется ссылка
        escape = next === undefined;
        break;
      default:
        break;
    }
    out += escape ? `\\${ch}` : ch;
  });
  return out;
};

// Начало строки, которое markdown прочёл бы как блок: заголовок, цитата, пункт списка,
// черта или подчёркивание заголовка. Экранируется первый символ (у нумерации — точка).
const BLOCK_START = [/^#{1,6}([ \t]|$)/, /^>/, /^[-+]([ \t]|$)/, /^-[- \t]*$/];
const escapeLineStart = (escaped, plain) => {
  if (BLOCK_START.some((re) => re.test(plain))) return `\\${escaped}`;
  const ordered = /^(\d{1,9})[.)]([ \t]|$)/.exec(plain);
  if (ordered) {
    const n = ordered[1].length;
    return `${escaped.slice(0, n)}\\${escaped.slice(n)}`;
  }
  return escaped;
};

const codeSpan = (text) => {
  const longest = Math.max(0, ...(text.match(/`+/g) || []).map((run) => run.length));
  const fence = '`'.repeat(longest + 1);
  const pad = /^`|`$/.test(text) || (/^ .+ $/.test(text) && /[^ ]/.test(text)) ? ' ' : '';
  return `${fence}${pad}${text}${pad}${fence}`;
};

const linkDestination = (url) =>
  /[\s<>]/.test(url) || url === ''
    ? `<${url.replace(/[\\<>]/g, '\\$&')}>`
    : url.replace(/[\\()]/g, '\\$&');

const QUOTE_ID = /^\d+$/;

// Дельта → строки { block, segments: [{ text, f }] }; f — только форматы моста.
const deltaLines = (ops) => {
  const lines = [];
  let segments = [];
  for (const op of ops || []) {
    if (typeof op.insert !== 'string') continue;
    const attrs = op.attributes || {};
    const parts = op.insert.split('\n');
    parts.forEach((part, k) => {
      if (k > 0) {
        lines.push({ block: attrs, segments });
        segments = [];
      }
      if (!part) return;
      const f = {};
      if (attrs['code-block']) {
        segments.push({ text: part, f });
        return;
      }
      if (attrs.code) f.code = true;
      if (attrs.bold) f.bold = true;
      if (attrs.italic) f.italic = true;
      if (attrs.strike) f.strike = true;
      if (attrs.link) f.link = String(attrs.link);
      if (attrs.background) {
        const cell = cellFromBackground(attrs.background) || MD_DEFAULT_COLOR;
        const id = attrs.id !== undefined && attrs.id !== null && QUOTE_ID.test(String(attrs.id)) ? String(attrs.id) : '';
        f.mark = `${cell}|${id}`;
      }
      segments.push({ text: part, f });
    });
  }
  if (segments.length) lines.push({ block: {}, segments });
  return lines.map(({ block, segments: segs }) => ({ block: blockOf(block), segments: mergeSegments(segs) }));
};

const blockOf = (attrs) => {
  if (attrs['code-block']) {
    const language = attrs['code-block'];
    return { type: 'code', language: typeof language === 'string' && language !== CODE_PLAIN ? language : '' };
  }
  if (attrs.header) return { type: 'header', level: Math.min(6, Math.max(1, Number(attrs.header) || 1)) };
  if (attrs.list === 'ordered') return { type: 'ordered' };
  if (attrs.list) return { type: 'bullet' };
  if (attrs.blockquote) return { type: 'quote' };
  return { type: 'plain' };
};

// f — только форматы моста, ключи наперечёт
const sameF = (a, b) =>
  a.code === b.code &&
  a.bold === b.bold &&
  a.italic === b.italic &&
  a.strike === b.strike &&
  a.link === b.link &&
  a.mark === b.mark;

const mergeSegments = (segments) => {
  const merged = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && sameF(last.f, seg.f)) last.text += seg.text;
    else merged.push({ text: seg.text, f: { ...seg.f } });
  }
  return merged.filter((seg) => seg.text);
};

const withoutKey = (f, key) => {
  const { [key]: dropped, ...rest } = f;
  return rest;
};

const EMPHASIS = ['strike', 'bold', 'italic'];
const WS = /\s/;

// Пробелы на краях жирного, курсива и зачёркивания выносятся за разделители: «** a**» не разметка.
const shedWhitespace = (segments) => {
  let segs = segments;
  for (const key of EMPHASIS) {
    const chars = segs.flatMap((seg) => [...seg.text].map((ch) => ({ ch, f: { ...seg.f } })));
    let i = 0;
    while (i < chars.length) {
      if (!chars[i].f[key]) {
        i += 1;
        continue;
      }
      let j = i;
      while (j < chars.length && chars[j].f[key]) j += 1;
      let a = i;
      while (a < j && !chars[a].f.code && WS.test(chars[a].ch)) delete chars[a++].f[key];
      let b = j - 1;
      while (b >= a && !chars[b].f.code && WS.test(chars[b].ch)) delete chars[b--].f[key];
      i = j;
    }
    segs = mergeSegments(chars.map(({ ch, f }) => ({ text: ch, f })));
  }
  return segs;
};

// Края строки без пробелов (markdown их не хранит); тело выделения не кончается на «=»,
// код с «==» внутри выделения разорвал бы его границу.
const normalizeLine = (segments) => {
  let segs = shedWhitespace(
    mergeSegments(
      segments.map((seg) =>
        seg.f.mark && seg.f.code && seg.text.includes('==') ? { ...seg, f: withoutKey(seg.f, 'code') } : seg,
      ),
    ),
  );
  const plain = (seg) => !seg.f.code && !seg.f.mark && !seg.f.link;
  while (segs.length && plain(segs[0]) && /^\s/.test(segs[0].text)) {
    segs[0] = { ...segs[0], text: segs[0].text.replace(/^\s+/, '') };
    if (!segs[0].text) segs.shift();
  }
  while (segs.length && plain(segs[segs.length - 1]) && /\s$/.test(segs[segs.length - 1].text)) {
    const last = segs[segs.length - 1];
    segs[segs.length - 1] = { ...last, text: last.text.replace(/\s+$/, '') };
    if (!segs[segs.length - 1].text) segs.pop();
  }
  // хвостовые «=» выделения уходят за него, пока тело не кончится другим символом
  for (let i = segs.length - 1; i >= 0; i -= 1) {
    const seg = segs[i];
    if (!seg.f.mark || seg.f.code || segs[i + 1]?.f.mark === seg.f.mark || !/=$/.test(seg.text)) continue;
    const body = seg.text.replace(/=+$/, '');
    const tail = { text: seg.text.slice(body.length), f: withoutKey(seg.f, 'mark') };
    segs = [...segs.slice(0, i), ...(body ? [{ ...seg, text: body }] : []), tail, ...segs.slice(i + 1)];
  }
  return mergeSegments(segs);
};

const PRIORITY = ['link', 'mark', 'strike', 'bold', 'italic'];
const DELIMITERS = { bold: '**', italic: '*', strike: '~~' };
const WORD_JOINER = String.fromCharCode(0x2060);

// Сегменты строки → токены open / close / text / code. keepOpen — выделение, открытое на
// прошлой строке (его открытие не пишется), carry — выделение, которое можно не закрывать.
const lineTokens = (segments, { keepOpen, carry }) => {
  const tokens = [];
  const stack = [];
  const runLength = (i, key, value) => {
    let n = 0;
    while (i + n < segments.length && segments[i + n].f[key] === value) n += 1;
    const toEnd = i + n === segments.length;
    return toEnd && carry?.key === key && carry.value === value ? Infinity : n;
  };
  const open = (key, value, seg, silent) => {
    stack.push({ key, value });
    tokens.push({ kind: 'open', key, value, seg, silent });
  };
  const closeTo = (depth, seg) => {
    while (stack.length > depth) {
      const { key, value } = stack.pop();
      tokens.push({ kind: 'close', key, value, seg });
    }
  };
  if (keepOpen) open(keepOpen.key, keepOpen.value, 0, true);
  segments.forEach((seg, i) => {
    const j = stack.findIndex(({ key, value }) => seg.f[key] !== value);
    if (j >= 0) closeTo(j, i);
    const opened = new Set(stack.map(({ key }) => key));
    let toOpen = PRIORITY.filter((key) => seg.f[key] !== undefined && !opened.has(key)).map(
      (key) => ({ key, value: seg.f[key], n: runLength(i, key, seg.f[key]) }),
    );
    // Выделение не разрывается: формат, который кончится внутри него, переоткрывается
    // внутри — иначе одна цитата стала бы двумя с одним id.
    const mark = toOpen.find(({ key }) => key === 'mark');
    if (mark) {
      const k = stack.findIndex(({ key, value }) => runLength(i, key, value) < mark.n);
      if (k >= 0) {
        toOpen = [
          ...toOpen,
          ...stack.slice(k).map(({ key, value }) => ({ key, value, n: runLength(i, key, value) })),
        ];
        closeTo(k, i);
      }
    }
    toOpen
      .sort((a, b) => b.n - a.n || PRIORITY.indexOf(a.key) - PRIORITY.indexOf(b.key))
      .forEach(({ key, value }) => open(key, value, i, false));
    tokens.push({
      kind: seg.f.code ? 'code' : 'text',
      seg: i,
      text: seg.text,
      inLink: opened.has('link') || seg.f.link !== undefined,
    });
  });
  const carried =
    !!carry && stack.length > 0 && stack[0].key === carry.key && stack[0].value === carry.value;
  closeTo(carried ? 1 : 0, segments.length);
  return { tokens, carried };
};

const tokenString = (token) => {
  if (token.kind === 'text') return token.s;
  if (token.kind === 'code') return codeSpan(token.text);
  const { key, value, kind } = token;
  if (key === 'link') return kind === 'open' ? '[' : `](${linkDestination(value)})`;
  if (key === 'mark') {
    if (token.silent) return '';
    const [cell, id] = value.split('|');
    return kind === 'open' ? `==${MD_COLORS[cell].emoji}${token.pad}` : `==${id ? `^${id}` : ''}`;
  }
  return DELIMITERS[key];
};

// Экранирование текстов строки; правила начала строки — для текста, перед которым ничего
// не записано, хвост «#» заголовка — для последнего текста.
const escapeTokens = (tokens, { lineStart, header }) => {
  let atStart = lineStart;
  tokens.forEach((token, i) => {
    if (token.kind === 'text') {
      let s = escapeText(token.text, token.inLink);
      const prev = tokens[i - 1];
      // цифры сразу за ==…== прочитались бы как ^id
      if (prev?.kind === 'close' && prev.key === 'mark' && /^\d/.test(token.text)) {
        s = WORD_JOINER + s;
      }
      if (atStart) s = escapeLineStart(s, token.text);
      if (header && i === tokens.length - 1) {
        s = s.replace(/(^|[ \t])(#+[ \t]*)$/, '$1\\$2');
      }
      token.s = s;
    }
    if (!(token.kind === 'open' && token.silent)) atStart = false;
  });
  tokens.forEach((token, i) => {
    if (token.kind === 'open' && token.key === 'mark') {
      const next = tokens[i + 1];
      // пробел сразу за эмодзи маркер съедает как необязательный
      token.pad = next?.kind === 'text' && next.s.startsWith(' ') ? ' ' : '';
    }
  });
};

const closesScope = (token) => token?.kind === 'close' && (token.key === 'mark' || token.key === 'link');

// Разделители * и ~ по правилам markdown-it: флангование и «правило трёх» для *.
// Возвращает индекс токена, который не прочтётся как задуман, или -1.
const brokenDelimiter = (tokens) => {
  const strings = tokens.map(tokenString);
  const runs = [];
  tokens.forEach((token, i) => {
    if (!DELIMITERS[token.key] || token.kind === 'text' || token.kind === 'code') return;
    const marker = strings[i][0];
    const last = runs[runs.length - 1];
    if (last && last.end === i && last.marker === marker) {
      last.items.push(i);
      last.end = i + 1;
    } else {
      runs.push({ marker, items: [i], start: i, end: i + 1 });
    }
  });
  const runOf = new Map();
  for (const run of runs) {
    const before = [...strings.slice(0, run.start).join('')];
    // конец тела выделения и подписи ссылки markdown-it считает пробелом
    const after = closesScope(tokens[run.end]) ? '' : strings.slice(run.end).join('');
    const lastCp = before.length ? before[before.length - 1].codePointAt(0) : 0x20;
    const nextCp = after ? after.codePointAt(0) : 0x20;
    const lastPunct = isPunct(lastCp);
    const nextPunct = isPunct(nextCp);
    const lastWs = isWhiteSpace(lastCp);
    const nextWs = isWhiteSpace(nextCp);
    run.canOpen = !nextWs && (!nextPunct || lastWs || lastPunct);
    run.canClose = !lastWs && (!lastPunct || nextWs || nextPunct);
    run.length = run.items.reduce((sum, k) => sum + strings[k].length, 0);
    run.items.forEach((k) => runOf.set(k, run));
  }
  const oddMatch = (opener, closer) =>
    (opener.canClose || closer.canOpen) &&
    (opener.length + closer.length) % 3 === 0 &&
    (opener.length % 3 !== 0 || closer.length % 3 !== 0);
  const open = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const run = runOf.get(i);
    if (!run) continue;
    const token = tokens[i];
    if (token.kind === 'open') {
      if (!run.canOpen) return i;
      // открытие, которое может и закрывать, markdown-it сперва пробует закрытием
      // ещё открытого * — и разбирает строку не так
      if (
        run.marker === '*' &&
        run.canClose &&
        open.some((k) => runOf.get(k) !== run && !oddMatch(runOf.get(k), run))
      ) {
        return i;
      }
      if (run.marker === '*') open.push(i);
      continue;
    }
    if (!run.canClose) return i;
    if (run.marker !== '*') continue;
    const k = open.findLastIndex((j) => tokens[j].key === token.key);
    const opener = runOf.get(open[k]);
    if (opener && oddMatch(opener, run)) return i;
    if (k >= 0) open.splice(k, 1);
  }
  return -1;
};

const URL_TAIL = /(?:https?|ftp):\/\/\S*$/i;

// Адрес в тексте linkify дочитывает до пробела: разделитель вплотную за адресом ушёл бы в
// ссылку. Проходят только закрытие тела выделения или подписи ссылки и «*», который
// markdown-it срезает с конца адреса, если за ним пробел или конец строки.
const brokenUrl = (tokens) => {
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i].kind !== 'text' || !URL_TAIL.test(tokens[i].text)) continue;
    let j = i + 1;
    while (tokens[j]?.kind === 'close' && tokens[j].key !== 'mark' && tokens[j].key !== 'link' && tokenString(tokens[j]).startsWith('*')) j += 1;
    const next = tokens[j];
    if (!next || closesScope(next)) continue;
    if (next.kind === 'text' && /^\s/.test(next.s)) continue;
    return next.kind === 'text' ? j - 1 : j;
  }
  return -1;
};

// Формат снимается с участка строки, где его нельзя записать.
const dropFormat = (segments, token) => {
  if (token.kind === 'code') {
    return mergeSegments(
      segments.map((seg, k) => (k === token.seg ? { ...seg, f: withoutKey(seg.f, 'code') } : seg)),
    );
  }
  const { key, value } = token;
  let at = token.kind === 'open' ? token.seg : token.seg - 1;
  at = Math.max(0, Math.min(at, segments.length - 1));
  let i = at;
  while (i > 0 && segments[i - 1].f[key] === value) i -= 1;
  let j = at;
  while (j < segments.length && segments[j].f[key] === value) j += 1;
  return mergeSegments(
    segments.map((seg, k) => (k >= i && k < j ? { ...seg, f: withoutKey(seg.f, key) } : seg)),
  );
};

const renderLine = (segments, options) => {
  let segs = segments;
  for (;;) {
    const { tokens, carried } = lineTokens(segs, options);
    escapeTokens(tokens, options);
    let broken = brokenDelimiter(tokens);
    if (broken < 0) broken = brokenUrl(tokens);
    if (broken < 0) return { text: tokens.map(tokenString).join(''), carried };
    segs = dropFormat(segs, tokens[broken]);
  }
};

const LIST_TYPES = new Set(['bullet', 'ordered']);

// Пробелы у переноса внутри выделения markdown не хранит: с края строки уходят пробельные
// куски и пробелы. null — у края строки выделения не осталось.
const trimEdge = (segments, mark, side) => {
  const segs = side < 0 ? [...segments] : [...segments].reverse();
  const edge = side < 0 ? /[ \t]+$/ : /^[ \t]+/;
  while (segs.length && segs[segs.length - 1].f.mark === mark && !segs[segs.length - 1].text.replace(edge, '')) {
    segs.pop();
  }
  const last = segs[segs.length - 1];
  if (!last || last.f.mark !== mark) return null;
  segs[segs.length - 1] = { ...last, text: last.text.replace(edge, '') };
  return side < 0 ? segs : segs.reverse();
};

// Следующая строка продолжает абзац этой: туда может перейти выделение.
const continuesParagraph = (block, next) =>
  next.type === 'plain' || (block.type === 'quote' && next.type === 'quote');

// deltaToMarkdown зовётся на каждую правку в Visual: неизменные строки берутся из памяти
// (статья 60 КБ — 34 мс на правку без неё).
const memo = new Map();
const remember = (key, compute) => {
  if (memo.has(key)) return memo.get(key);
  if (memo.size > 5000) memo.clear();
  const value = compute();
  memo.set(key, value);
  return value;
};

// Дельта Quill → канонический исходник; markdownToDelta читает его обратно в ту же дельту.
export const deltaToMarkdown = (ops) => {
  const lines = deltaLines(ops).map((line) =>
    line.block.type === 'code'
      ? line
      : {
          ...line,
          segments: remember(`n${JSON.stringify(line.segments)}`, () => normalizeLine(line.segments)),
        },
  );
  const out = [];
  let counter = 0;
  let blanksAfterEmptyItem = -1;
  let keepOpen = null;
  for (let i = 0; i < lines.length; i += 1) {
    const { block, segments } = lines[i];
    if (block.type === 'code') {
      const group = [];
      const { language } = block;
      for (; i < lines.length && lines[i].block.type === 'code' && lines[i].block.language === language; i += 1) {
        group.push(lines[i].segments.map((seg) => seg.text).join(''));
      }
      i -= 1;
      const longest = Math.max(2, ...group.flatMap((text) => (text.match(/`+/g) || []).map((run) => run.length)));
      const fence = '`'.repeat(longest + 1);
      out.push(fence + language, ...group, fence);
      counter = 0;
      keepOpen = null;
      continue;
    }
    const prev = lines[i - 1];
    const next = lines[i + 1];
    if (block.type === 'plain' && !segments.length && blanksAfterEmptyItem >= 0) {
      blanksAfterEmptyItem += 1;
      if (blanksAfterEmptyItem >= 2) counter = 0;
    }
    if (block.type === 'ordered') {
      counter += 1;
      blanksAfterEmptyItem = segments.length ? -1 : 0;
    } else if (block.type !== 'plain' || segments.length) {
      counter = 0;
      blanksAfterEmptyItem = -1;
    }

    // пустой пункт сразу за строкой абзаца прочёлся бы подчёркиванием заголовка
    if (
      !segments.length &&
      LIST_TYPES.has(block.type) &&
      prev?.block.type === 'plain' &&
      prev.segments.length
    ) {
      out.push('');
      counter = 0;
      keepOpen = null;
      continue;
    }

    const last = segments[segments.length - 1];
    let carry =
      block.type !== 'header' &&
      last?.f.mark &&
      !last.f.mark.endsWith('|') &&
      next &&
      next.segments[0]?.f.mark === last.f.mark &&
      continuesParagraph(block, next.block)
        ? { key: 'mark', value: last.f.mark }
        : null;
    let lineSegments = segments;
    if (carry) {
      const tail = trimEdge(segments, carry.value, -1);
      const head = trimEdge(next.segments, carry.value, 1);
      if (tail && head) {
        lineSegments = tail;
        next.segments = head;
      } else {
        carry = null;
      }
    }
    const options = {
      lineStart: block.type !== 'header',
      header: block.type === 'header',
      keepOpen,
      carry,
    };
    const { text, carried } = remember(
      `r${JSON.stringify([lineSegments, block.type, keepOpen?.value, carry?.value])}`,
      () => renderLine(lineSegments, options),
    );
    keepOpen = carried ? carry : null;
    switch (block.type) {
      case 'header':
        out.push(`${'#'.repeat(block.level)}${text ? ` ${text}` : ''}`);
        break;
      case 'bullet':
        out.push(text ? `- ${text}` : '-');
        break;
      case 'ordered':
        out.push(text ? `${counter}. ${text}` : `${counter}.`);
        break;
      case 'quote':
        out.push(text ? `> ${text}` : '>');
        break;
      default:
        out.push(text);
    }
  }
  return out.join('\n');
};

// Markdown статьи хода: грамматика выделения ==…==, id цитат, плоский текст и рендер.
// Без импортов из приложения: markdown-it и DOMPurify приходят параметрами, поэтому модуль
// исполняется в юнит-харнессе как есть.
//
//   ==текст==                жёлтое выделение (цвет по умолчанию)
//   ==🔴текст== ==🔴 текст==  цвет эмодзи из MD_COLORS сразу после ==, U+FE0F и пробел за ним необязательны
//   ==🔴текст==^1793693029    id цитаты; дописывается при сохранении (ensureQuoteIds)
//
// Буквы цвета маркерами не являются: ==g текст== — жёлтое с текстом «g текст».
// Внутри выделения живёт инлайновая разметка, вложенных выделений нет, выделение не
// пересекает пустую строку.

// Ключ ячейки цвета → эмодзи исходника и фон палитры (тот же, что у цитат тулбара Quill).
export const MD_COLORS = {
  y: { emoji: '🟡', rgb: 'rgb(255, 255, 0)' },
  g: { emoji: '🟢', rgb: 'rgb(138, 255, 36)' },
  p: { emoji: '🟣', rgb: 'rgb(253, 201, 255)' },
  b: { emoji: '🔵', rgb: 'rgb(156, 245, 255)' },
  s: { emoji: '⚪', rgb: 'rgb(210, 211, 212)' },
  o: { emoji: '🟠', rgb: 'rgb(255, 213, 150)' },
  r: { emoji: '🔴', rgb: 'rgb(255, 99, 99)' },
};
export const MD_DEFAULT_COLOR = 'y';
export const QUOTE_TYPE_TEXT = 'text';

export const MD_COLOR_EMOJI = Object.fromEntries(
  Object.entries(MD_COLORS).map(([key, { emoji }]) => [key, emoji]),
);
const EMOJI_TO_COLOR = Object.fromEntries(
  Object.entries(MD_COLORS).map(([key, { emoji }]) => [emoji, key]),
);

// Группы: 1 — маркер целиком (эмодзи, U+FE0F, пробел), 2 — эмодзи, 3 — тело, 4 — цифры id.
// Тело: не пустое, не начинается с «=», без «==» и без пустой строки.
const MARK_SOURCE = `==((${Object.keys(EMOJI_TO_COLOR).join('|')})\\uFE0F? ?)?([^=\\n](?:[^=\\n]|\\n(?!\\n)|=(?!=))*?)==(?:\\^(\\d+))?`;
const MARK_AT = new RegExp(MARK_SOURCE, 'y');

// Инлайновая разметка → текст: для поля text цитаты и для плоского абзаца. Приближение,
// не парсер: ссылки и картинки оставляют подпись, остальное снимает обёртки.
const stripInline = (text) =>
  text
    .replace(/!?\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)/g, '$1')
    .replace(/<(https?:\/\/[^>\s]+)>/g, '$1')
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!>|~=^])/g, '$1');

const EQUALS = 0x3d;
const BACKSLASH = 0x5c;
const BACKTICK = 0x60;
const ASCII_PUNCT = /^[!-/:-@[-`{-~]$/;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const HEADING_RE = /^ {0,3}#{1,6}(?:[ \t]|$)/;
const ITEM_RE = /^ {0,3}(?:[-*+]|\d{1,9}[.)])(?:[ \t]|$)/;
const QUOTE_PREFIX_RE = /^(?: {0,3}> ?)*/;
const SETEXT_RE = /^ {0,3}(?:=+|-+)[ \t]*$/;
const HR_RE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;

const indentOf = (line) => {
  let column = 0;
  for (const ch of line) {
    if (ch === ' ') column += 1;
    else if (ch === '\t') column += 4 - (column % 4);
    else break;
  }
  return column;
};

// Блоки по порядку: { start, end, code } — код ``` / ~~~ или с отступом 4, или { start, end } — кусок
// инлайновой разметки. Приближение блочного разбора markdown-it: контейнер пункта не разбирается.
const splitBlocks = (text) => {
  const blocks = [];
  let piece = null;
  let fence = null;
  let prev = 'blank';
  let prevDepth = 0;
  let inList = false;
  const closePiece = () => {
    if (piece) blocks.push(piece);
    piece = null;
  };
  const closeFence = (end) => {
    blocks.push({ start: fence.start, end, code: fence.lines.join('\n') });
    fence = null;
  };
  for (let start = 0, lineEnd = 0; start <= text.length; start = lineEnd + 1) {
    lineEnd = text.indexOf('\n', start);
    if (lineEnd === -1) lineEnd = text.length;
    const raw = text.slice(start, lineEnd).replace(/\r$/, '');
    const [prefix] = raw.match(QUOTE_PREFIX_RE);
    const depth = (prefix.match(/>/g) || []).length;
    const line = raw.slice(prefix.length);

    // блок кончается вместе с контейнером: цитатой или пунктом, в строке которого начался
    if (fence && (depth < fence.depth || (line.trim() && indentOf(line) < fence.inItem))) {
      closeFence(start - 1);
    }
    if (fence) {
      const close = FENCE_RE.exec(line);
      if (close && close[1][0] === fence.marker[0] && close[1].length >= fence.marker.length && !close[2].trim()) {
        closeFence(lineEnd);
        prev = 'code';
      } else {
        fence.lines.push(line.replace(fence.indent, ''));
      }
      prevDepth = depth;
      continue;
    }
    if (!line.trim()) {
      closePiece();
      prev = 'blank';
      prevDepth = depth;
      continue;
    }
    const indent = indentOf(line);
    // подчёркивание заголовка и черта — границы абзаца, разметки в них нет
    if ((prev === 'text' && SETEXT_RE.test(line)) || HR_RE.test(line)) {
      closePiece();
      prev = 'heading';
      prevDepth = depth;
      continue;
    }
    if (indent >= 4 && !inList && prev !== 'text') {
      closePiece();
      blocks.push({ start, end: lineEnd, code: line.replace(/^(?: {4}| {0,3}\t)/, '') });
      prev = 'code';
      prevDepth = depth;
      continue;
    }
    const item = indent < 4 && ITEM_RE.exec(line);
    // блок в строке пункта (- ```) — по тексту после маркера
    const body = item ? line.slice(item[0].length) : line;
    const open = indent < 4 && FENCE_RE.exec(body);
    const opensFence = open && !(open[1][0] === '`' && open[2].includes('`'));
    const heading = indent < 4 && HEADING_RE.test(body);
    if (item) inList = true;
    else if (indent === 0 && (prev === 'blank' || heading || opensFence)) inList = false;
    if (opensFence) {
      closePiece();
      const column = line.length - body.trimStart().length;
      fence = {
        start,
        depth,
        marker: open[1],
        indent: new RegExp(`^ {0,${column}}`),
        inItem: item ? column : 0,
        lines: [],
      };
      prev = 'code';
    } else if (heading) {
      closePiece();
      blocks.push({ start, end: lineEnd });
      prev = 'heading';
    } else {
      if (item || depth > prevDepth) closePiece();
      if (piece) piece.end = lineEnd;
      else piece = { start, end: lineEnd };
      prev = 'text';
    }
    prevDepth = depth;
  }
  closePiece();
  if (fence) closeFence(text.length);
  return blocks;
};

// Инлайновый проход [from, to) в порядке markdown-it: экранирование, код в строке (серии ` и их кэш —
// как у него), выделение — тем же выражением, что у markRule.
const scanInline = (text, from, to, { onMark, onCode }) => {
  const src = text.slice(0, to);
  const lastRun = [];
  let scanned = false;
  const findCloser = (from, size) => {
    for (let at = src.indexOf('`', from); at !== -1; ) {
      let end = at + 1;
      while (src.charCodeAt(end) === BACKTICK) end += 1;
      if (end - at === size) return at;
      lastRun[end - at] = at;
      at = src.indexOf('`', end);
    }
    scanned = true;
    return -1;
  };
  let pos = from;
  while (pos < to) {
    const ch = src.charCodeAt(pos);
    if (ch === BACKSLASH && ASCII_PUNCT.test(src[pos + 1] || '')) {
      pos += 2;
    } else if (ch === BACKTICK) {
      let openEnd = pos + 1;
      while (src.charCodeAt(openEnd) === BACKTICK) openEnd += 1;
      const size = openEnd - pos;
      const closer = scanned && (lastRun[size] ?? -1) <= pos ? -1 : findCloser(openEnd, size);
      if (closer === -1) {
        pos = openEnd;
      } else {
        onCode?.(pos, closer + size, src.slice(openEnd, closer));
        pos = closer + size;
      }
    } else if (ch === EQUALS && src.charCodeAt(pos + 1) === EQUALS) {
      MARK_AT.lastIndex = pos;
      const match = MARK_AT.exec(src);
      if (match) {
        onMark?.(match);
        pos += match[0].length;
      } else {
        pos += 1;
      }
    } else {
      pos += 1;
    }
  }
};

const walkSource = (text, handlers) => {
  for (const block of splitBlocks(text)) {
    if (block.code === undefined) scanInline(text, block.start, block.end, handlers);
    else handlers.onCode?.(block.start, block.end, block.code, true);
  }
};

// Выделения исходника по порядку: { id, color, text, start, end, idStart }.
// color — ключ ячейки; id — число или null; idStart — где начинается хвост ^id (равен end без хвоста).
// Внутри кода выделений нет; разбор без markdown-it — сохранение синхронное.
export const parseMarks = (source) => {
  const marks = [];
  walkSource(source || '', {
    onMark: (match) => {
      const [whole, , emoji, body, digits] = match;
      const end = match.index + whole.length;
      marks.push({
        id: digits ? Number(digits) : null,
        color: EMOJI_TO_COLOR[emoji] || MD_DEFAULT_COLOR,
        text: stripInline(body).trim(),
        start: match.index,
        end,
        idStart: digits ? end - digits.length - 1 : end,
      });
    },
  });
  return marks;
};

// Выделениям без id (и повторам одного id после копирования) дописывает свежие id:
// от Math.floor(now / 1000) + 1, занятые пропускаются — как у новых цитат абзаца.
// Повторный вызов на результате ничего не меняет.
export const ensureQuoteIds = (source, now) => {
  const text = source || '';
  const marks = parseMarks(text);
  const taken = new Set(
    marks.filter((mark) => mark.id !== null).map((mark) => String(mark.id)),
  );
  let lastId = Math.floor(now / 1000);
  const freshId = () => {
    do lastId += 1;
    while (taken.has(String(lastId)));
    return lastId;
  };

  const seen = new Set();
  const quotes = [];
  let result = '';
  let cursor = 0;
  for (const mark of marks) {
    let { id } = mark;
    if (id === null || seen.has(String(id))) {
      id = freshId();
      result += `${text.slice(cursor, mark.idStart)}^${id}`;
      cursor = mark.end;
    }
    seen.add(String(id));
    quotes.push({ id, text: mark.text, type: QUOTE_TYPE_TEXT });
  }
  return { source: result + text.slice(cursor), quotes };
};

// Код в строке — как его текст у markdown-it: перевод строки — пробел, по пробелу с краёв снимается.
const codeSpanText = (content) => content.replace(/\n/g, ' ').replace(/^ (.+) $/, '$1');

// Текст без разметки, без маркеров цвета и без ^id — производный paragraph хода (превью лобби, поиск, бот).
// Код — как есть: на время снятия разметки он заменён заглушкой из частной области Юникода.
export const toPlainText = (source) => {
  const text = (source || '').replace(/\r\n?/g, '\n');
  const held = [];
  const hold = (code) => `\uE000${held.push(code) - 1}\uE001`;
  const holdSpans = (body) => {
    let out = '';
    let cursor = 0;
    scanInline(body, 0, body.length, {
      onCode: (start, end, content) => {
        out += body.slice(cursor, start) + hold(codeSpanText(content));
        cursor = end;
      },
    });
    return out + body.slice(cursor);
  };
  let out = '';
  let cursor = 0;
  walkSource(text, {
    onCode: (start, end, content, block) => {
      out += text.slice(cursor, start) + hold(block ? content : codeSpanText(content));
      cursor = end;
    },
    onMark: (match) => {
      out += text.slice(cursor, match.index) + holdSpans(match[3]);
      cursor = match.index + match[0].length;
    },
  });
  out += text.slice(cursor);
  return stripInline(
    out
      .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
      .replace(/^[ \t]*(?:>[ \t]?)+/gm, '')
      .replace(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/gm, '')
      .replace(/^[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$/gm, '')
      .replace(/^\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*$/gm, '')
      .replace(/^[ \t]*\|[ \t]*|[ \t]*\|[ \t]*$/gm, '')
      .replace(/[ \t]*\|[ \t]*/g, ' '),
  )
    .replace(/\uE000(\d+)\uE001/g, (whole, index) => held[index] ?? whole)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Конфигурация рендера — точка расширения: новая возможность разметки добавляется здесь,
// а не в коде рендера. Что не перечислено в allowedTags / allowedAttrs, DOMPurify срезает.
export const MD_RENDER_CONFIG = {
  preset: 'default',
  // html: false — сырой HTML экранируется; breaks — перевод строки даёт <br>, как в абзаце Quill.
  options: { html: false, linkify: true, typographer: false, breaks: true },
  // правила markdown-it, выключенные поверх пресета: картинки грузятся с чужих хостов,
  // а те держат запросы десятками секунд
  disable: ['image'],
  // атрибуты каждой ссылки, в том числе собранной linkify
  linkAttrs: [
    ['target', '_blank'],
    ['rel', 'noopener noreferrer'],
  ],
  // sup — только ^id выделения в предпросмотре (render с showQuoteIds); сырой HTML экранирован
  allowedTags: [
    'p', 'br', 'strong', 'em', 's', 'del', 'a', 'mark', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup',
  ],
  allowedAttrs: ['href', 'target', 'rel', 'data-id', 'data-color'],
};

// Инлайновое правило markdown-it: ==[эмодзи]тело==[^id] → mark_open … mark_close [mark_id].
// Границы — то же выражение, что у parseMarks; тело токенизируется тем же инлайн-парсером
// (так устроено правило link самого markdown-it).
export const markRule = (state, silent) => {
  const { src, posMax } = state;
  const start = state.pos;
  if (src.charCodeAt(start) !== EQUALS || src.charCodeAt(start + 1) !== EQUALS) {
    return false;
  }
  MARK_AT.lastIndex = start;
  const match = MARK_AT.exec(src.slice(0, posMax));
  if (!match) return false;
  const [whole, marker, emoji, body, id] = match;
  // markIds: false — выделение только оформление: без data-id и без mark_id, хвост ^id съедается
  const withId = id !== undefined && state.env?.markIds !== false;

  if (!silent) {
    const bodyStart = start + 2 + (marker ? marker.length : 0);
    const token = state.push('mark_open', 'mark', 1);
    token.attrs = [['data-color', EMOJI_TO_COLOR[emoji] || MD_DEFAULT_COLOR]];
    if (withId) token.attrs.unshift(['data-id', id]);
    state.pos = bodyStart;
    state.posMax = bodyStart + body.length;
    // инлайновый linkify читает src дальше posMax и съел бы закрывающее == у адреса в теле;
    // адрес внутри выделения находит ядровый linkify в пределах текста
    state.linkLevel += 1;
    state.md.inline.tokenize(state);
    state.linkLevel -= 1;
    state.posMax = posMax;
    state.push('mark_close', 'mark', -1);
    if (withId) state.push('mark_id', '', 0).content = id;
  }
  state.pos = start + whole.length;
  return true;
};

// markdownIt — фабрика markdown-it (default export), purify — объект с sanitize(html, cfg)
// (DOMPurify, привязанный к window). Возвращает { render(source, { showQuoteIds, markIds }) → html, md }:
// showQuoteIds — ^id выделений серым верхним индексом (предпросмотр формы), карточка — без;
// markIds: false — выделения без data-id (ячейки перевода: цвет есть, цитат и линий нет).
export const createRenderer = ({ markdownIt, purify, config = MD_RENDER_CONFIG }) => {
  const md = markdownIt(config.preset, config.options);
  if (config.disable?.length) md.disable(config.disable);
  md.inline.ruler.before('emphasis', 'mark', markRule);
  md.renderer.rules.mark_id = (tokens, idx, options, env) =>
    env?.showQuoteIds ? `<sup>^${tokens[idx].content}</sup>` : '';
  md.core.ruler.push('link_attrs', (state) => {
    for (const block of state.tokens) {
      if (block.type !== 'inline') continue;
      for (const token of block.children) {
        if (token.type !== 'link_open') continue;
        for (const [name, value] of config.linkAttrs) token.attrSet(name, value);
      }
    }
  });
  const purifyConfig = {
    ALLOWED_TAGS: config.allowedTags,
    ALLOWED_ATTR: config.allowedAttrs,
    ALLOW_DATA_ATTR: false,
  };
  return {
    md,
    render: (source, { showQuoteIds = false, markIds = true } = {}) =>
      purify.sanitize(md.render(source || '', { showQuoteIds, markIds }), purifyConfig),
  };
};

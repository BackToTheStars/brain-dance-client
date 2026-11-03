// Markdown статьи хода: грамматика выделения ==…==, id цитат, плоский текст и рендер.
// Без импортов из приложения: markdown-it и DOMPurify приходят параметрами, поэтому модуль
// исполняется в юнит-харнессе как есть.
//
//   ==текст==           жёлтое выделение (цвет по умолчанию)
//   ==g текст==         цвет буквой: одна буква из MD_COLORS и пробел за ней, иначе это текст
//   ==g текст==^1664763801   id цитаты; дописывается при сохранении (ensureQuoteIds)
//
// Внутри выделения живёт инлайновая разметка, вложенных выделений нет, выделение не
// пересекает пустую строку.

// Те же шесть фонов, что у цитат тулбара Quill.
export const MD_COLORS = {
  y: 'rgb(255, 255, 0)',
  g: 'rgb(138, 255, 36)',
  p: 'rgb(253, 201, 255)',
  b: 'rgb(156, 245, 255)',
  s: 'rgb(210, 211, 212)',
  o: 'rgb(255, 213, 150)',
};
export const MD_DEFAULT_COLOR = 'y';
export const QUOTE_TYPE_TEXT = 'text';

const COLOR_LETTERS = Object.keys(MD_COLORS).join('');

// Тело: не пустое, не начинается с «=», без «==» и без пустой строки.
const MARK_RE = new RegExp(
  `==(?:([${COLOR_LETTERS}]) )?([^=\\n](?:[^=\\n]|\\n(?!\\n)|=(?!=))*?)==(?:\\^(\\d+))?`,
  'g',
);

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

// Выделения исходника по порядку: { id, color, text, start, end, idStart }.
// id — число или null; idStart — где начинается хвост ^id (равен end, когда хвоста нет).
export const parseMarks = (source) => {
  const marks = [];
  for (const match of (source || '').matchAll(MARK_RE)) {
    const [whole, letter, body, digits] = match;
    const end = match.index + whole.length;
    marks.push({
      id: digits ? Number(digits) : null,
      color: letter || MD_DEFAULT_COLOR,
      text: stripInline(body).trim(),
      start: match.index,
      end,
      idStart: digits ? end - digits.length - 1 : end,
    });
  }
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

// Текст без разметки и без ^id — производный paragraph хода (превью лобби, поиск, бот).
export const toPlainText = (source) =>
  stripInline(
    (source || '')
      .replace(/\r\n?/g, '\n')
      .replace(/^[ \t]*(```|~~~)[^\n]*\n?/gm, '')
      .replace(MARK_RE, '$2')
      .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
      .replace(/^[ \t]*(?:>[ \t]?)+/gm, '')
      .replace(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/gm, '')
      .replace(/^[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$/gm, '')
      .replace(/^\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*$/gm, '')
      .replace(/^[ \t]*\|[ \t]*|[ \t]*\|[ \t]*$/gm, '')
      .replace(/[ \t]*\|[ \t]*/g, ' '),
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();

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
  allowedTags: [
    'p', 'br', 'strong', 'em', 's', 'del', 'a', 'mark', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttrs: ['href', 'target', 'rel', 'data-id', 'data-color'],
};

const EQUALS = 0x3d;
const CARET = 0x5e;
const isDigit = (code) => code >= 0x30 && code <= 0x39;

// Инлайновое правило markdown-it: ==[c ]тело==[^id] → mark_open … mark_close.
// Тело токенизируется тем же инлайн-парсером в границах до закрывающего «==»
// (так устроено правило link самого markdown-it).
const markRule = (state, silent) => {
  const { src, posMax } = state;
  const start = state.pos;
  if (
    src.charCodeAt(start) !== EQUALS ||
    src.charCodeAt(start + 1) !== EQUALS ||
    src.charCodeAt(start + 2) === EQUALS
  ) {
    return false;
  }
  let bodyStart = start + 2;
  let color = MD_DEFAULT_COLOR;
  if (COLOR_LETTERS.includes(src[bodyStart]) && src[bodyStart + 1] === ' ') {
    color = src[bodyStart];
    bodyStart += 2;
  }
  const close = src.indexOf('==', bodyStart);
  if (close === -1 || close === bodyStart || close + 2 > posMax) return false;

  let end = close + 2;
  let id = null;
  if (src.charCodeAt(end) === CARET) {
    let i = end + 1;
    while (i < posMax && isDigit(src.charCodeAt(i))) i += 1;
    if (i > end + 1) {
      id = src.slice(end + 1, i);
      end = i;
    }
  }

  if (!silent) {
    const token = state.push('mark_open', 'mark', 1);
    token.attrs = [['data-color', color]];
    if (id !== null) token.attrs.unshift(['data-id', id]);
    state.pos = bodyStart;
    state.posMax = close;
    state.md.inline.tokenize(state);
    state.posMax = posMax;
    state.push('mark_close', 'mark', -1);
  }
  state.pos = end;
  return true;
};

// markdownIt — фабрика markdown-it (default export), purify — объект с sanitize(html, cfg)
// (DOMPurify, привязанный к window). Возвращает { render(source) → html, md }.
export const createRenderer = ({ markdownIt, purify, config = MD_RENDER_CONFIG }) => {
  const md = markdownIt(config.preset, config.options);
  if (config.disable?.length) md.disable(config.disable);
  md.inline.ruler.before('emphasis', 'mark', markRule);
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
    render: (source) => purify.sanitize(md.render(source || ''), purifyConfig),
  };
};

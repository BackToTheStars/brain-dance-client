// Поиск фразы в отрисованном тексте части и подсветка найденного без правки DOM. Текст читается так
// же, как его читает поиск навигатора на сервере: пробелы схлопнуты, регистр не важен, вхождения не
// перекрываются; граница блочного элемента (абзац, пункт списка, ячейка) — пробел.

const BLOCK = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE',
  'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'OL', 'P', 'PRE', 'SECTION',
  'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
]);

export const MATCH_HIGHLIGHT = 'navigator-match';

// Куски текста по порядку [{ text, node, gap }] (gap — перед куском граница блока) → строка поиска и
// для каждого её знака — [node, offset] знака источника.
export const collapseSegments = (segments) => {
  let chars = '';
  const at = [];
  let space = true;
  for (const { text, node, gap } of segments) {
    if (gap && !space) {
      chars += ' ';
      at.push([node, 0]);
      space = true;
    }
    for (let i = 0; i < text.length; i += 1) {
      if (/\s/.test(text[i])) {
        if (space) continue;
        chars += ' ';
        at.push([node, i]);
        space = true;
        continue;
      }
      const lower = text[i].toLowerCase();
      for (let k = 0; k < lower.length; k += 1) at.push([node, i]);
      chars += lower;
      space = false;
    }
  }
  return { chars, at };
};

// Начало nth-го вхождения (с 1); нет nth-го — первого; нет и его — -1.
export const nthIndex = (chars, query, nth = 1) => {
  if (!query) return -1;
  let first = -1;
  let n = 0;
  for (let i = chars.indexOf(query); i >= 0; i = chars.indexOf(query, i + query.length)) {
    if (first < 0) first = i;
    n += 1;
    if (n === nth) return i;
  }
  return first;
};

export const normalizeQuery = (query) =>
  String(query || '').trim().replace(/\s+/g, ' ').toLowerCase();

const segmentsOf = (root) => {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, 1 | 4); // элементы и текст
  const segments = [];
  let gap = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === 1) {
      if (BLOCK.has(node.tagName)) gap = true;
      continue;
    }
    if (!node.data) continue;
    segments.push({ text: node.data, node, gap });
    gap = false;
  }
  return segments;
};

// Range nth-го вхождения query в тексте root (нет nth-го — первого), null — фразы нет.
export const findMatch = (root, query, nth = 1) => {
  const q = normalizeQuery(query);
  if (!root || !q) return null;
  const { chars, at } = collapseSegments(segmentsOf(root));
  const start = nthIndex(chars, q, nth);
  if (start < 0) return null;
  const [startNode, startOffset] = at[start];
  const [endNode, endOffset] = at[start + q.length - 1];
  const range = root.ownerDocument.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, Math.min(endNode.data.length, endOffset + 1));
  return range;
};

// Подсветка — CSS Custom Highlight API (::highlight в стилях карточки): узлы текста, рамки цитат и их
// замеры не трогаются. Снимается кликом в любом месте или следующим переходом. Без API — не рисуется.
let clearCurrent = null;

export const clearMatch = () => {
  clearCurrent?.();
  clearCurrent = null;
};

export const showMatch = (range) => {
  clearMatch();
  if (typeof CSS === 'undefined' || !CSS.highlights || typeof Highlight !== 'function') return false;
  CSS.highlights.set(MATCH_HIGHLIGHT, new Highlight(range));
  const off = () => clearMatch();
  document.addEventListener('pointerdown', off, true);
  clearCurrent = () => {
    CSS.highlights.delete(MATCH_HIGHLIGHT);
    document.removeEventListener('pointerdown', off, true);
  };
  return true;
};

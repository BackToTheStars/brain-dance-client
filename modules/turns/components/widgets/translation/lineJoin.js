// «Склеить строки» статьи: текст, нарезанный строками одной ширины (pdf → txt), собирается в абзацы.
// Чистый модуль: на входе тексты блоков, на выходе новые тексты и счётчики; markdown-it — параметром.
// Трогаются только строки абзацев верхнего уровня (по разбору markdown-it): заголовки, списки, код,
// таблицы, цитаты >, определения ссылок и линии остаются как были.

import { MD_RENDER_CONFIG } from '../md/markdown';
import { BLOCK_LIMIT, utf8Bytes } from './rows';

// Ширина нарезки W — этот процентиль длин строк абзацев (без последней строки абзаца); нарезка есть,
// если таких строк не меньше MIN_LINES и нижняя четверть их длин не короче SPREAD · W. Замер на книге
// (pdf → txt, шрифт не моноширинный: строки 84–98 знаков): 0,95 склеивал 79 % переносов, 0,75 — 92 %;
// 0,5 уже склеивал текст «предложение на строку».
export const WIDTH_PERCENTILE = 0.75;
export const MIN_LINES = 6;
export const SPREAD = 0.75;
// уже — скорее стихи или столбец, чем нарезка страницы
export const MIN_WIDTH = 30;
// Пограничный случай: слову не хватило не больше стольких знаков — решает конец строки.
export const SLACK = 2;

const text = (value) => (typeof value === 'string' ? value : '');
// буквы латиницы, греческого и кириллицы; регулярки без флага u — в разы быстрее на книге
const LETTERS = 'A-Za-zÀ-ɏͰ-ϿЀ-ԯ';
const LETTER = new RegExp(`[${LETTERS}]`);
const WORD = new RegExp(`[${LETTERS}0-9]+(?:-[${LETTERS}0-9]+)*`, 'g');
const FIRST_WORD = /^\S+/;
const CLOSERS = '"\'»”’)]';
const DROP = { drop: true };
const STOPS = '.!?:…';

const isLetter = (ch) => !!ch && LETTER.test(ch);
const isLower = (ch) => isLetter(ch) && ch !== ch.toUpperCase();

const endsSentence = (head) => {
  let i = head.length - 1;
  while (i >= 0 && CLOSERS.includes(head[i])) i -= 1;
  return i >= 0 && STOPS.includes(head[i]);
};

// Дефис переноса: дефис в конце строки сразу за знаком (« -», «—», «–» — тире). Слово до него —
// буквы перед дефисом ('' — перед дефисом не буква, например цифра).
const hyphenWord = (head) => {
  const end = head.length - 1;
  const before = head[end - 1];
  if (head[end] !== '-' || !before || /[\s-]/.test(before)) return null;
  let i = end;
  while (i > 0 && isLetter(head[i - 1])) i -= 1;
  return head.slice(i, end);
};

const lowerWord = (tail) => {
  if (!isLower(tail[0])) return null;
  let i = 1;
  while (i < tail.length && isLetter(tail[i])) i += 1;
  return tail.slice(0, i);
};

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

// Строки блока и отрезки многострочных абзацев верхнего уровня [start, end); только блочный
// разбор — инлайн границ не меняет. Абзацный отступ первой строки (4+ пробела) markdown-it читает
// строкой кода: leads — такие строки вплотную над абзацем [code, start, end], alone — строки кода
// в одну строку без абзаца под ними; first — блок начинается абзацем.
const paragraphsOf = (md, source) => {
  const normalized = source.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const parsed = { lines, spans: [], leads: [], alone: [], first: false };
  const tokens = [];
  md.block.parse(normalized, md, {}, tokens);
  let code = null;
  let firstSeen = false;
  for (const token of tokens) {
    if (token.level !== 0 || !token.map) continue;
    const [start, end] = token.map;
    const paragraph = token.type === 'paragraph_open';
    if (!firstSeen) {
      firstSeen = true;
      parsed.first = paragraph && start === 0;
    }
    if (code !== null && paragraph && start === code + 1) parsed.leads.push([code, start, end]);
    else if (code !== null) parsed.alone.push(code);
    code = token.type === 'code_block' && end - start === 1 ? start : null;
    if (paragraph && end - start >= 2) parsed.spans.push([start, end]);
  }
  if (code !== null) parsed.alone.push(code);
  return parsed;
};

// Блок — одна строка с абзацным отступом (для markdown-it — строка кода).
const INDENTED = /^(?:\t| {4,})[ \t]*\S/;
const isIndentedLine = (source) => !source.includes('\n') && INDENTED.test(source);

// Ширина нарезки по длинам строк; 0 — нарезки нет: строк мало или длины разбросаны.
export const cutWidth = (lengths) => {
  if (lengths.length < MIN_LINES) return 0;
  const sorted = Float64Array.from(lengths).sort();
  const at = (share) => sorted[Math.min(sorted.length - 1, Math.floor(share * sorted.length))];
  const width = at(WIDTH_PERCENTILE);
  if (width < MIN_WIDTH || at(0.25) < SPREAD * width) return 0;
  return width;
};

const sampleLengths = (parsed) => {
  const lengths = [];
  for (const { lines, spans } of parsed) {
    for (const [start, end] of spans) {
      for (let i = start; i < end - 1; i += 1) {
        const length = lines[i].trimEnd().length;
        if (length) lengths.push(length);
      }
    }
  }
  return lengths;
};

// Решение для пары строк: null — не склеивать; иначе { hyphen } — слово до дефиса переноса или null.
const decide = (line, next, width) => {
  if (line.endsWith('  ') || line.endsWith('\\')) return null;
  const head = line.trimEnd();
  const tail = next.trimStart();
  if (!head || !tail) return null;
  const word = FIRST_WORD.exec(tail)[0];
  const hyphen = hyphenWord(head);
  // с дефисом переноса не поместилось слово целиком: часть до дефиса уже на строке
  const room = hyphen ? head.length - 1 + word.length : head.length + 1 + word.length;
  if (room <= width && (room <= width - SLACK || endsSentence(head))) return null;
  return { hyphen };
};

// Слова, разорванные дефисом на краю строки: слитные формы «ab», которые статья пишет внутри строк.
const hyphenEvidence = (sources, wanted) => {
  const found = new Set();
  if (!wanted.size) return found;
  for (const source of sources) {
    for (const [word] of source.toLowerCase().matchAll(WORD)) if (wanted.has(word)) found.add(word);
  }
  return found;
};

// Стык двух строк по решению step: { text, hyphen } — hyphen, если дефис переноса снят.
const glue = (headLine, tailLine, step, found) => {
  let head = headLine.trimEnd();
  const tail = tailLine.trimStart();
  if (step.hyphen === null) return { text: `${head} ${tail}`, hyphen: false };
  const right = lowerWord(tail);
  const left = step.hyphen.toLowerCase();
  // дефис снимается, только если статья где-то пишет это слово слитно: на краю строки чаще составное
  // слово, чем перенос по слогам (замер на книге: 4 переноса из 268)
  const keep = !right || !left || !found.has(left + right);
  if (!keep) head = head.slice(0, -1);
  return { text: head + tail, hyphen: !keep };
};

// Склейка разобранного блока по готовым решениям; null — менять нечего. У отрезка с dedent первая
// строка — абзацный отступ: он снимается.
const joinParsed = ({ lines, spans }, steps, found) => {
  const out = [];
  let joined = 0;
  let hyphens = 0;
  let indents = 0;
  let line = 0;
  for (const [start, end, dedent] of spans) {
    while (line < start) out.push(lines[line++]);
    let current = dedent ? lines[start].trimStart() : lines[start];
    if (dedent) indents += 1;
    for (let i = start + 1; i < end; i += 1) {
      const step = steps?.get(i);
      if (step === DROP) continue;
      if (!step) {
        out.push(current);
        current = lines[i];
        continue;
      }
      const result = glue(current, lines[i], step, found);
      current = result.text;
      if (result.hyphen) hyphens += 1;
      joined += 1;
    }
    out.push(current);
    line = end;
  }
  if (!joined && !indents) return null;
  while (line < lines.length) out.push(lines[line++]);
  return { text: out.join('\n'), joined, hyphens };
};

// Слитная форма слова для решения о дефисе переноса между строками line и next.
const want = (wanted, step, next) => {
  if (step.hyphen === null) return;
  const right = lowerWord(next.trimStart());
  const left = step.hyphen.toLowerCase();
  if (!right || !left) return;
  wanted.add(left + right);
};

// Абзацный отступ. Строка с отступом вплотную над абзацем (в блоке или блок из одной такой строки
// перед блоком-абзацем — так делит Save) — первая строка абзаца: отступ снимается, склейка — по
// общему правилу. Отдельная строка с отступом снимается, только если так начинается больше половины
// многострочных абзацев статьи. Код в несколько строк не трогается.
const indentPlan = (md, list, parsed, width) => {
  const cross = new Map();
  const lone = [];
  let leads = 0;
  let total = 0;
  for (const block of parsed) {
    if (!block) continue;
    total += block.spans.length;
    for (const [, start, end] of block.leads) {
      leads += 1;
      if (end - start === 1) total += 1;
    }
  }
  for (let i = 0; i < list.length; i += 1) {
    if (!isIndentedLine(list[i])) continue;
    const next = i + 1 < list.length ? parsed[i + 1] || paragraphsOf(md, list[i + 1]) : null;
    const step = next?.first ? decide(list[i], next.lines[0], width) : null;
    if (!step) {
      lone.push(i);
      continue;
    }
    cross.set(i, step);
    leads += 1;
    if (!next.spans.some(([start]) => start === 0)) total += 1;
  }
  return { cross, lone, majority: leads * 2 > total };
};

// Решения по всем блокам: Map номер строки → шаг (склеить с предыдущей) на блок и нужные формы слов.
// Отрезки блока дополняются строками абзацного отступа.
const plan = (parsed, width, majority) => {
  const wanted = new Set();
  const steps = parsed.map((block) => {
    if (!block) return null;
    if (block.leads.length || (majority && block.alone.length)) {
      const starts = new Set(block.leads.map(([, start]) => start));
      block.spans = [
        ...block.spans.filter(([start]) => !starts.has(start)),
        ...block.leads.map(([code, , end]) => [code, end, true]),
        ...(majority ? block.alone.map((code) => [code, code + 1, true]) : []),
      ].sort((a, b) => a[0] - b[0]);
    }
    const map = new Map();
    for (const [start, end] of block.spans) {
      // строка из одних пробельных знаков внутри абзаца — разрыв страницы (\f) из pdf: склейка идёт
      // через неё, сама она уходит
      let prev = start;
      for (let i = start + 1; i < end; i += 1) {
        if (block.lines[i].trim() === '') continue;
        const step = decide(block.lines[prev], block.lines[i], width);
        const from = prev;
        prev = i;
        if (!step) continue;
        for (let k = from + 1; k < i; k += 1) map.set(k, DROP);
        map.set(i, step);
        want(wanted, step, block.lines[i]);
      }
    }
    return map.size || block.spans.some((span) => span[2]) ? map : null;
  });
  return { steps, wanted };
};

// Тексты блоков статьи → { texts, lines, blocks, hyphens, width }: texts — по порядку (нетронутый
// блок — та же строка; блок, ушедший первой строкой в следующий, — пустая строка), lines — сколько
// переносов снято, blocks — сколько блоков изменилось, hyphens — сколько дефисов переноса убрано,
// width — ширина нарезки (0 — нарезки нет, склеек нет). Блок, который вышел бы больше limit байт, не
// трогается.
export const joinArticleLines = (sources, { markdownIt, limit = BLOCK_LIMIT } = {}) => {
  const list = (Array.isArray(sources) ? sources : []).map(text);
  const none = { texts: list, lines: 0, blocks: 0, hyphens: 0, width: 0 };
  if (!markdownIt) return none;
  const md = parserOf(markdownIt);
  const parsed = list.map((source) => (source.includes('\n') ? paragraphsOf(md, source) : null));
  const width = cutWidth(sampleLengths(parsed.filter(Boolean)));
  if (!width) return none;
  const { cross, lone, majority } = indentPlan(md, list, parsed, width);
  const { steps, wanted } = plan(parsed, width, majority);
  for (const [i, step] of cross) want(wanted, step, (parsed[i + 1]?.lines[0] ?? list[i + 1]));
  const found = hyphenEvidence(list, wanted);
  let lines = 0;
  let hyphens = 0;
  const texts = list.map((source, i) => {
    if (!steps[i]) return source;
    const result = joinParsed(parsed[i], steps[i], found);
    if (!result || utf8Bytes(result.text) > limit) return source;
    lines += result.joined;
    hyphens += result.hyphens;
    return result.text;
  });
  for (const [i, step] of cross) {
    const next = texts[i + 1];
    const firstEnd = next.indexOf('\n');
    const result = glue(list[i].trimStart(), firstEnd < 0 ? next : next.slice(0, firstEnd), step, found);
    const merged = firstEnd < 0 ? result.text : result.text + next.slice(firstEnd);
    if (utf8Bytes(merged) > limit) continue;
    texts[i] = '';
    texts[i + 1] = merged;
    lines += 1;
    if (result.hyphen) hyphens += 1;
  }
  if (majority) for (const i of lone) texts[i] = list[i].trimStart();
  let blocks = 0;
  for (let i = 0; i < list.length; i += 1) if (texts[i] !== list[i]) blocks += 1;
  return { texts, lines, blocks, hyphens, width };
};

// Один блок как статья из одного блока: ширина и слова — по нему самому.
export const joinBlockLines = (source, options) => {
  const result = joinArticleLines([source], options);
  return { text: result.texts[0], lines: result.lines, hyphens: result.hyphens, width: result.width };
};

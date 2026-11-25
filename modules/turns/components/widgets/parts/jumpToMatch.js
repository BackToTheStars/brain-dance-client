// Переход из навигатора к найденному в теле карточки: дождаться тела, прокрутить к части (блоку
// статьи, ряду перевода), найти вхождение и подсветить. Текст успели изменить после поиска: нет
// nth-го вхождения — первое в части; нет и его — начало части; нет части — остаётся карточка.
// Абзац Quill — тот же путь без частей: вхождение ищется во всём теле. Прокрутка — как ручная.
// У сжатой статьи и перевода ряд лежит в своём окошке: прокручивается оно, ход не разворачивается.

import { TID } from '@/config/testIds';
import { clearMatch, findMatch, showMatch } from './textMatch';
import { partsOf } from './useVisibleParts';

// Ход может ещё грузиться, рендер md — подгружаться лениво.
const WAIT_MS = 5000;
// Карточка без частей на месте, а тела абзаца нет (сжатый абзац) — недолго ждать и бросить.
const CARD_FRAMES = 15;

let generation = 0;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const cardOf = (turnId) =>
  document.querySelector(`[data-test-id="${TID.turnCard}"][data-turn-id="${turnId}"]`);

const bodyOf = (turnId, withParts) => {
  const card = cardOf(turnId);
  if (!card) return null;
  if (withParts) {
    const el = card.querySelector('.md-body, .translation-body');
    const parts = partsOf(el);
    return parts ? { el, parts } : null;
  }
  const el = card.querySelector('.stb-widget-paragraph .paragraphText.original-text');
  return el ? { el, parts: null } : null;
};

// Прокрутить тело так, чтобы прямоугольник оказался в окне, — только если его там нет: уже видимое
// совпадение не двигает тело. topOnly — достаточно, чтобы в окне был верх (начало блока).
const reveal = (body, rect, topOnly = false) => {
  if (!rect.width && !rect.height) return;
  const box = body.getBoundingClientRect();
  if (rect.top >= box.top && (topOnly ? rect.top < box.bottom : rect.bottom <= box.bottom)) return;
  const scale = box.height && body.offsetHeight ? body.offsetHeight / box.height : 1;
  body.scrollTop += (rect.top - box.top) * scale - (topOnly ? 0 : body.clientHeight / 3);
};

// Снять подсветку и прервать переход в пути (ссылка на карточку, новый переход).
export const cancelJump = () => {
  generation += 1;
  clearMatch();
};

// at — из строки навигатора: { row, column, nth } у статьи в рядах и перевода, { nth } у абзаца
// и статьи без рядов; query — строка поиска.
export const jumpToMatch = async ({ turnId, contentType, at, query }) => {
  cancelJump();
  const token = generation;
  const alive = () => token === generation;
  const withParts = contentType === 'md' || contentType === 'translation';
  const deadline = performance.now() + WAIT_MS;
  let body = null;
  let cardFrames = 0;
  while (alive() && performance.now() < deadline) {
    body = bodyOf(turnId, withParts);
    if (body) break;
    if (!withParts && cardOf(turnId) && (cardFrames += 1) > CARD_FRAMES) return;
    await nextFrame();
  }
  if (!body || !alive()) return;
  // только что смонтированное тело ещё восстанавливает свою прокрутку в эффектах — после них
  await nextFrame();
  if (!alive() || !body.el.isConnected) return;

  let root = body.el;
  let scroller = body.el;
  if (at?.row != null) {
    if (!body.parts) return;
    const part = await body.parts.scrollToPart(String(at.row));
    if (!part || !alive()) return;
    if (partsOf(part.parentElement)) scroller = part.parentElement;
    root = (at.column && part.querySelector(`[data-side="${at.column}"]`)) || part;
  }
  const range = findMatch(root, query, at?.nth || 1);
  if (!range) {
    if (root !== body.el) reveal(scroller, root.getBoundingClientRect(), true);
    return;
  }
  reveal(scroller, range.getBoundingClientRect());
  showMatch(range);
};

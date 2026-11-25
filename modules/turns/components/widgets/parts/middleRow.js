// Форма правки статьи и перевода открывается на том же месте, что карточка: ряд (блок) в середине
// видимой в окне части тела карточки запоминается при открытии формы — до того, как холст сдвинется
// под панель, — и редактор ставит этот ряд в середину своего тела. Тело в начале — ничего.
// У сжатого хода тело не прокручивается: берётся окошко, ближайшее к середине видимой части тела, и
// ряд из его центра.

const FRESH_MS = 5000;
// Сколько кадров доводить ряд до середины: ячейки Visual и замеры соседей меняют высоты после монтажа.
const CENTRE_FRAMES = 30;
const STABLE_FRAMES = 3;
const RETRIES = 3;

let pending = null;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const rowsOf = (scroller) => scroller.querySelectorAll(':scope > [data-row-id]');

// Середина видимой в окне браузера части коробки.
const middleOf = (box) => {
  const top = Math.max(box.top, 0);
  const bottom = Math.min(box.bottom, window.innerHeight);
  return bottom > top ? (top + bottom) / 2 : (box.top + box.bottom) / 2;
};

const nearestWindow = (body, y) => {
  let found = null;
  let nearest = Infinity;
  for (const el of body.querySelectorAll(':scope > .turn-compressed-window:not([aria-hidden])')) {
    const box = el.getBoundingClientRect();
    const distance = y < box.top ? box.top - y : y > box.bottom ? y - box.bottom : 0;
    if (distance < nearest) {
      nearest = distance;
      found = el;
    }
  }
  return found;
};

export const rememberMiddleRow = (turnId) => {
  pending = null;
  if (typeof document === 'undefined') return;
  const body = document.querySelector(
    `:is(.md-body, .translation-body)[data-turn-id="${CSS.escape(String(turnId))}"]`,
  );
  if (!body) return;
  const compressed = body.dataset?.compressed === 'true';
  if (!compressed && body.scrollTop < 1) return;
  const scroller = compressed ? nearestWindow(body, middleOf(body.getBoundingClientRect())) : body;
  if (!scroller) return;
  const y = middleOf(scroller.getBoundingClientRect());
  // разделители — без data-row-id
  let rowId = null;
  let nearest = Infinity;
  for (const row of rowsOf(scroller)) {
    const r = row.getBoundingClientRect();
    if (r.top <= y && r.bottom > y) {
      rowId = row.dataset.rowId;
      break;
    }
    const distance = Math.min(Math.abs(r.top - y), Math.abs(r.bottom - y));
    if (distance < nearest) {
      nearest = distance;
      rowId = row.dataset.rowId;
    }
  }
  if (rowId) pending = { turnId, rowId, at: Date.now() };
};

export const takeMiddleRow = (turnId) => {
  const found = pending;
  pending = null;
  return found && found.turnId === turnId && Date.now() - found.at < FRESH_MS ? found.rowId : null;
};

// Подвести ряд id (scrollToPart хука частей) и держать его на месте, пока сходятся высоты соседей:
// away(box, rect) — на сколько экранных px ряд ниже нужного места. Колесо, клик или клавиша в
// скроллере прерывают доводку. Ответ: false — ряда нет.
const settlePart = async (scroller, scrollToPart, id, away) => {
  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  const events = ['wheel', 'pointerdown', 'keydown', 'touchstart'];
  for (const type of events) scroller.addEventListener(type, stop, { passive: true });
  try {
    let part = await scrollToPart(id);
    let found = !!part;
    let stable = 0;
    let retries = RETRIES;
    let last = 0;
    for (let frame = 0; frame < CENTRE_FRAMES && stable < STABLE_FRAMES; frame += 1) {
      if (stopped || !scroller.isConnected) return found;
      if (!part?.isConnected) part = [...rowsOf(scroller)].find((row) => row.dataset.rowId === id);
      // ряд ушёл из окна (высоты соседей ещё сходились) — подвести заново
      if (!part) {
        if (!(retries -= 1)) return found;
        part = await scrollToPart(id);
        found = found || !!part;
        continue;
      }
      const box = scroller.getBoundingClientRect();
      const rect = part.getBoundingClientRect();
      const scale = box.height && scroller.offsetHeight ? scroller.offsetHeight / box.height : 1;
      const off = Math.round(away(box, rect) * scale);
      // ряд скачет туда и обратно на один и тот же сдвиг: раскладка зависит от прокрутки — оставить
      if (Math.abs(off) > 1 && Math.abs(off + last) <= 2) return found;
      last = off;
      const before = scroller.scrollTop;
      if (Math.abs(off) > 1) scroller.scrollTop += off;
      stable = scroller.scrollTop === before ? stable + 1 : 0;
      await nextFrame();
    }
    return found;
  } finally {
    for (const type of events) scroller.removeEventListener(type, stop);
  }
};

// Середина ряда — на середину скроллера.
export const centrePart = (scroller, scrollToPart, id) =>
  settlePart(scroller, scrollToPart, id, (box, rect) => (rect.top + rect.bottom - box.top - box.bottom) / 2);

// Ряд у верхнего края скроллера и сдвиг края от верха ряда (px скроллера); скроллер в начале или
// без рядов — null. Пара к placePart: вернуть скроллер на то же место после смены его содержимого.
export const topPart = (scroller) => {
  if (!scroller || scroller.scrollTop < 1) return null;
  const box = scroller.getBoundingClientRect();
  const scale = box.height && scroller.offsetHeight ? scroller.offsetHeight / box.height : 1;
  for (const row of rowsOf(scroller)) {
    const rect = row.getBoundingClientRect();
    if (rect.bottom > box.top + 1) return { id: row.dataset.rowId, offset: (box.top - rect.top) * scale };
  }
  return null;
};

export const placePart = (scroller, scrollToPart, { id, offset }) => {
  const box = scroller.getBoundingClientRect();
  const scale = box.height && scroller.offsetHeight ? scroller.offsetHeight / box.height : 1;
  return settlePart(scroller, scrollToPart, id, (now, rect) => rect.top - now.top + offset / scale);
};

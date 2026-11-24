// Форма правки статьи и перевода открывается на том же месте, что карточка: ряд (блок) в середине
// видимой в окне части тела карточки запоминается при открытии формы — до того, как холст сдвинется
// под панель, — и редактор ставит этот ряд в середину своего тела. Тело в начале — ничего.

const FRESH_MS = 5000;
// Сколько кадров доводить ряд до середины: ячейки Visual и замеры соседей меняют высоты после монтажа.
const CENTRE_FRAMES = 30;
const STABLE_FRAMES = 3;
const RETRIES = 3;

let pending = null;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const rowsOf = (scroller) => scroller.querySelectorAll(':scope > [data-row-id]');

export const rememberMiddleRow = (turnId) => {
  pending = null;
  if (typeof document === 'undefined') return;
  const body = document.querySelector(
    `:is(.md-body, .translation-body)[data-turn-id="${CSS.escape(String(turnId))}"]`,
  );
  if (!body || body.scrollTop < 1) return;
  const box = body.getBoundingClientRect();
  const top = Math.max(box.top, 0);
  const bottom = Math.min(box.bottom, window.innerHeight);
  const y = bottom > top ? (top + bottom) / 2 : (box.top + box.bottom) / 2;
  // у сжатого хода data-row-id окошка — ряд, из которого оно; разделители без data-row-id
  let rowId = null;
  let nearest = Infinity;
  for (const row of rowsOf(body)) {
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

// Подвести ряд id (scrollToPart хука частей) и поставить его середину на середину скроллера. Колесо,
// клик или клавиша в скроллере прерывают доводку.
export const centrePart = async (scroller, scrollToPart, id) => {
  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  const events = ['wheel', 'pointerdown', 'keydown', 'touchstart'];
  for (const type of events) scroller.addEventListener(type, stop, { passive: true });
  try {
    let part = await scrollToPart(id);
    let stable = 0;
    let retries = RETRIES;
    let last = 0;
    for (let frame = 0; frame < CENTRE_FRAMES && stable < STABLE_FRAMES; frame += 1) {
      if (stopped || !scroller.isConnected) return;
      if (!part?.isConnected) part = [...rowsOf(scroller)].find((row) => row.dataset.rowId === id);
      // ряд ушёл из окна (высоты соседей ещё сходились) — подвести заново
      if (!part) {
        if (!(retries -= 1)) return;
        part = await scrollToPart(id);
        continue;
      }
      const box = scroller.getBoundingClientRect();
      const rect = part.getBoundingClientRect();
      const scale = box.height && scroller.offsetHeight ? scroller.offsetHeight / box.height : 1;
      const off = Math.round(((rect.top + rect.bottom - box.top - box.bottom) / 2) * scale);
      // ряд скачет туда и обратно на один и тот же сдвиг: раскладка зависит от прокрутки — оставить
      if (Math.abs(off) > 1 && Math.abs(off + last) <= 2) return;
      last = off;
      const before = scroller.scrollTop;
      if (Math.abs(off) > 1) scroller.scrollTop += off;
      stable = scroller.scrollTop === before ? stable + 1 : 0;
      await nextFrame();
    }
  } finally {
    for (const type of events) scroller.removeEventListener(type, stop);
  }
};

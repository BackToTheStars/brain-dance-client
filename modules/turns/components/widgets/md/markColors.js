// Ячейки цвета выделений: одна таблица для выделений статьи и цитат абзаца на карточке.
// Ячейка — ключ из MD_COLORS (эмодзи исходника, фон палитры); цвет показа — из colorSet,
// как у цитат абзаца. remap — необязательная карта { ячейка: ячейка }: ячейке показывается
// цвет другой ячейки; исходник и дельты не меняются. Ключи перечислены ещё и в turn.scss.

import { colorSet, getNeedBlackText, rgbToHex } from '../../helpers/color';
import { MD_COLORS, MD_DEFAULT_COLOR } from './markdown';

export const COLOR_CELL_KEYS = Object.keys(MD_COLORS);

export const COLOR_CELLS = Object.fromEntries(
  COLOR_CELL_KEYS.map((key) => {
    const { emoji, rgb } = MD_COLORS[key];
    const hex = rgbToHex(rgb);
    return [key, { key, emoji, rgb, hex }];
  }),
);

const CELL_BY_HEX = Object.fromEntries(
  COLOR_CELL_KEYS.map((key) => [COLOR_CELLS[key].hex, key]),
);

const normalizeColor = (color) =>
  typeof color === 'string' ? rgbToHex(color.trim()).toLowerCase() : '';

// Фон цитаты абзаца ('#ffff00' из дельты или 'rgb(255, 255, 0)') → ключ ячейки или null.
export const cellFromBackground = (background) =>
  CELL_BY_HEX[normalizeColor(background)] || null;

// Значение NEXT_PUBLIC_MARK_COLORS → карта: пары «<ячейка>:<ячейка>» через запятую, «r:o» —
// красное показывается оранжевым. Пара не по формату, неизвестная ячейка или повтор ячейки слева
// пропускаются, одно предупреждение на всё значение.
export const parseColorRemap = (value, warn = console.warn) => {
  const remap = {};
  const skipped = [];
  for (const pair of String(value ?? '').split(',')) {
    const item = pair.trim();
    if (!item) continue;
    const [from, to, extra] = item.split(':').map((part) => part.trim());
    const valid =
      extra === undefined &&
      COLOR_CELL_KEYS.includes(from) &&
      COLOR_CELL_KEYS.includes(to) &&
      !Object.hasOwn(remap, from);
    if (valid) remap[from] = to;
    else skipped.push(item);
  }
  if (skipped.length) {
    warn(
      `NEXT_PUBLIC_MARK_COLORS: skipped ${skipped.join(', ')}; expected <cell>:<cell>, cells ${COLOR_CELL_KEYS.join(' ')}`,
    );
  }
  return remap;
};

export const resolveColorCell = (cell, remap) => {
  const key = COLOR_CELLS[cell] ? cell : MD_DEFAULT_COLOR;
  const target = remap?.[key];
  return COLOR_CELLS[target] ? target : key;
};

// Варианты показа по типу хода — как у цитат абзаца: colorSet[turnType], иначе colorSet.turn.
const displayVariants = (turnType) => colorSet[turnType] || colorSet.turn;

const withText = (cell, background) => ({
  cell,
  background,
  text: getNeedBlackText(background) ? '#000' : '#fff',
});

// Ячейка → { cell, background, text }; palette — фон палитры без вариантов карточки (форма).
export const cellDisplayColor = (cell, { turnType, remap, palette = false } = {}) => {
  const key = resolveColorCell(cell, remap);
  const { hex } = COLOR_CELLS[key];
  return withText(key, palette ? hex : displayVariants(turnType)[hex] || hex);
};

// Фон цитаты абзаца → цвет показа; фон не из палитры показывается как раньше.
export const quoteDisplayColor = (background, options = {}) => {
  const cell = cellFromBackground(background);
  if (cell) return cellDisplayColor(cell, options);
  return withText(null, displayVariants(options.turnType)[background] || background);
};

// CSS-переменные контейнера статьи: --md-mark-<ячейка> (фон и рамка) и --md-mark-<ячейка>-text.
export const markColorVars = (options) =>
  Object.fromEntries(
    COLOR_CELL_KEYS.flatMap((key) => {
      const { background, text } = cellDisplayColor(key, options);
      return [
        [`--md-mark-${key}`, background],
        [`--md-mark-${key}-text`, text],
      ];
    }),
  );

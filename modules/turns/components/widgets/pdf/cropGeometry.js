// Обрезка полей pdf: доли страницы, отсекаемые слева, справа, сверху и снизу,
// одна обрезка на весь документ. Цитаты хранятся в координатах полной страницы,
// а рисуются и выделяются в видимой области — перевод между этими системами
// живёт здесь и больше нигде (fullToVisibleRect при отрисовке,
// visibleToFullRect при сохранении новой цитаты).

export const CROP_SIDES = ['left', 'right', 'top', 'bottom'];

export const EMPTY_CROP = { left: 0, right: 0, top: 0, bottom: 0 };

// Видимая полоса не может быть уже этого: делитель (1 − left − right) уходит
// в ноль, а ширина канваса вместе с ним — в бесконечность.
const MIN_VISIBLE_FRACTION = 0.05;

const toFraction = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(num, 1);
};

export const clampCrop = (crop) => {
  const result = { ...EMPTY_CROP };
  if (!crop) return result;
  for (const [near, far] of [
    ['left', 'right'],
    ['top', 'bottom'],
  ]) {
    let first = toFraction(crop[near]);
    let second = toFraction(crop[far]);
    const room = 1 - MIN_VISIBLE_FRACTION;
    const total = first + second;
    if (total > room) {
      first = (first * room) / total;
      second = (second * room) / total;
    }
    result[near] = first;
    result[far] = second;
  }
  return result;
};

// Отсутствие обрезки — это null, а не объект из нулей: по нему весь расчёт
// пропускается, и ход без обрезки считается ровно так же, как до её появления.
export const getCrop = (crop) => {
  const value = clampCrop(crop);
  return CROP_SIDES.some((side) => value[side] > 0) ? value : null;
};

export const isSameCrop = (one, other) =>
  CROP_SIDES.every((side) => (one?.[side] || 0) === (other?.[side] || 0));

export const getCropScale = (crop) =>
  crop
    ? { x: 1 - crop.left - crop.right, y: 1 - crop.top - crop.bottom }
    : { x: 1, y: 1 };

// Высота бокса страницы на карточке. Канвас рисуется страницей целиком на
// ширине pageWidth / scale.x, а видно из него только полосу scale.y.
export const getPageBoxHeight = (pageWidth, aspect, crop) => {
  const scale = getCropScale(crop);
  return Math.round((pageWidth * aspect * scale.y) / scale.x);
};

export const fullToVisibleRect = (rect, crop) => {
  if (!crop) return rect;
  const scale = getCropScale(crop);
  return {
    x: (rect.x - crop.left * 100) / scale.x,
    y: (rect.y - crop.top * 100) / scale.y,
    width: rect.width / scale.x,
    height: rect.height / scale.y,
  };
};

export const visibleToFullRect = (rect, crop) => {
  if (!crop) return rect;
  const scale = getCropScale(crop);
  return {
    x: crop.left * 100 + rect.x * scale.x,
    y: crop.top * 100 + rect.y * scale.y,
    width: rect.width * scale.x,
    height: rect.height * scale.y,
  };
};

// Рамка окна настройки — «видимая область» в процентах полной страницы, и
// обратный перевод её в доли обрезки.
export const cropToFrame = (crop) => {
  const value = clampCrop(crop);
  return {
    unit: '%',
    x: value.left * 100,
    y: value.top * 100,
    width: (1 - value.left - value.right) * 100,
    height: (1 - value.top - value.bottom) * 100,
  };
};

export const frameToCrop = (frame) => {
  if (!frame || !frame.width || !frame.height) return { ...EMPTY_CROP };
  return clampCrop({
    left: frame.x / 100,
    top: frame.y / 100,
    right: (100 - frame.x - frame.width) / 100,
    bottom: (100 - frame.y - frame.height) / 100,
  });
};

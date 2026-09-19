// Бюджет канваса страницы pdf. Канвас несёт страницу целиком: при обрезке полей
// его ширина — ширина бокса, делённая на видимую долю (а она бывает и 5 %), и
// сверху её умножает devicePixelRatio. Без потолка допустимая обрезка просит у
// браузера холст в гигабайты, поэтому сторона и площадь ограничены, а лишнее
// снимается понижением разрешения. Геометрию это не трогает: css-размеры
// канваса, высота бокса и координаты цитат считаются отдельно (cropGeometry).

// Выше — только расход памяти: страница не рисуется крупнее двух пикселей на css-пиксель.
export const MAX_PIXEL_RATIO = 2;

// Потолок одного канваса. Взят по самому слабому из целевых браузеров (iOS
// Safari отказывает примерно на 16,8 Мпикс), чтобы холст, о котором мы просим,
// мог выделить любой: 4096² — это 64 МиБ RGBA на страницу, а отрисованные
// страницы документа держатся в памяти все сразу.
export const MAX_CANVAS_SIDE = 8192;
export const MAX_CANVAS_AREA = 4096 * 4096;

// Сколько пикселей канваса приходится на css-пиксель страницы: девайсный
// масштаб, понижённый ровно настолько, чтобы уложиться в бюджет. aspect —
// пропорция страницы из вьюпорта pdf.js, поворот в неё уже внесён.
export const getRenderRatio = (renderWidth, aspect, pixelRatio) => {
  const device = Number(pixelRatio);
  const ratio = Math.min(device > 0 ? device : 1, MAX_PIXEL_RATIO);
  if (!(renderWidth > 0) || !(aspect > 0)) return ratio;

  const width = renderWidth * ratio;
  const height = width * aspect;
  const limit = Math.min(
    1,
    MAX_CANVAS_SIDE / width,
    MAX_CANVAS_SIDE / height,
    Math.sqrt(MAX_CANVAS_AREA / (width * height)),
  );
  if (limit >= 1) return ratio;
  // ниже одного пикселя по ширине опускаться некуда
  return Math.max(ratio * limit, 1 / renderWidth);
};

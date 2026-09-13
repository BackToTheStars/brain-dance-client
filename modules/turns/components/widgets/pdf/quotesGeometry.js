// Пересчёт прямоугольных цитат PDF из «координат документа» (номер страницы +
// проценты от её бокса) в координаты карточки хода — то, что ждёт
// lines.quotesInfo: из него рисуются и сами рамки, и якоря логических линий.
//
// Логика видимости — как у текстовых цитат (components/helpers/quotesHelper.js):
// частично видимая цитата обрезается по границе виджета, полностью ускроленная
// превращается в маркер нулевой высоты у верхнего/нижнего края, чтобы линия
// не уходила в пустоту и было видно, что цитата есть выше/ниже.
//
// Считается только арифметика (без обращений к DOM), причём для страниц вне
// вьюпорта геометрия не вычисляется вовсе — им сразу выдаётся краевой маркер.

import { TYPE_QUOTE_PDF } from '@/modules/quotes/settings';
import { fullToVisibleRect, getPageBoxHeight } from './cropGeometry';

const MIN_VISIBLE_HEIGHT = 4; // тоньше — уже неотличимо от маркера

const edgeMarker = ({ position, widgetLeft, widgetTop, viewportWidth, viewportHeight }) => ({
  left: widgetLeft,
  width: viewportWidth,
  height: 0,
  top: position === 'top' ? widgetTop : widgetTop + viewportHeight,
  position,
});

export const getPdfQuotesWithCoords = ({
  quotes,
  pageOffsets,
  pageWidth,
  scrollTop,
  viewportWidth,
  viewportHeight,
  widgetLeft,
  widgetTop,
  turnId,
  crop = null,
}) => {
  if (!pageOffsets.length || !pageWidth || !viewportHeight) return [];

  const windowTop = scrollTop;
  const windowBottom = scrollTop + viewportHeight;

  const result = [];

  for (const quote of quotes) {
    const pageOffset = pageOffsets[quote.page - 1];
    if (!pageOffset) continue; // страницы нет в документе — цитата осиротела

    const base = {
      type: TYPE_QUOTE_PDF,
      initialCoords: {},
      quoteId: quote.id,
      quoteKey: `${turnId}_${quote.id}`,
      turnId,
      page: quote.page,
      text: `pdfQuote_${quote.id}`,
    };

    // страница целиком вне вьюпорта — считать координаты цитат незачем
    if (pageOffset.top + pageOffset.height <= windowTop) {
      result.push({
        ...base,
        ...edgeMarker({ position: 'top', widgetLeft, widgetTop, viewportWidth, viewportHeight }),
      });
      continue;
    }
    if (pageOffset.top >= windowBottom) {
      result.push({
        ...base,
        ...edgeMarker({ position: 'bottom', widgetLeft, widgetTop, viewportWidth, viewportHeight }),
      });
      continue;
    }

    // цитата лежит в координатах полной страницы, а бокс страницы на карточке —
    // это её видимая область: сюда и приводим
    const rect = fullToVisibleRect(quote, crop);
    const pageBottom = pageOffset.top + pageOffset.height;
    const quoteTop = Math.min(
      Math.max(pageOffset.top + (pageOffset.height * rect.y) / 100, pageOffset.top),
      pageBottom,
    );
    const quoteBottom = Math.max(
      Math.min(
        pageOffset.top + (pageOffset.height * (rect.y + rect.height)) / 100,
        pageBottom,
      ),
      pageOffset.top,
    );

    // цитату увело под обрез целиком — маркер у того края, за который её увело
    if (quoteBottom <= quoteTop) {
      result.push({
        ...base,
        ...edgeMarker({
          position: rect.y + rect.height <= 0 ? 'top' : 'bottom',
          widgetLeft,
          widgetTop,
          viewportWidth,
          viewportHeight,
        }),
      });
      continue;
    }

    if (quoteBottom <= windowTop) {
      result.push({
        ...base,
        ...edgeMarker({ position: 'top', widgetLeft, widgetTop, viewportWidth, viewportHeight }),
      });
      continue;
    }
    if (quoteTop >= windowBottom) {
      result.push({
        ...base,
        ...edgeMarker({ position: 'bottom', widgetLeft, widgetTop, viewportWidth, viewportHeight }),
      });
      continue;
    }

    // видна целиком или частично — обрезаем по окну виджета
    const visibleTop = Math.max(quoteTop, windowTop);
    const visibleHeight = Math.min(quoteBottom, windowBottom) - visibleTop;

    if (visibleHeight < MIN_VISIBLE_HEIGHT) {
      result.push({
        ...base,
        ...edgeMarker({
          position: quoteTop < windowTop ? 'top' : 'bottom',
          widgetLeft,
          widgetTop,
          viewportWidth,
          viewportHeight,
        }),
      });
      continue;
    }

    // по горизонтали обрез отсекает так же, как прокрутка по вертикали:
    // частично — обрезаем, целиком — маркер нулевой ширины у края страницы
    const left = Math.max(rect.x, 0);
    const right = Math.min(rect.x + rect.width, 100);
    const isCutOff = right <= left;

    result.push({
      ...base,
      left: Math.round(
        widgetLeft + (pageWidth * (isCutOff ? (rect.x < 0 ? 0 : 100) : left)) / 100,
      ),
      top: Math.round(widgetTop + visibleTop - scrollTop),
      width: isCutOff ? 0 : Math.round((pageWidth * (right - left)) / 100),
      height: Math.round(visibleHeight),
      position: 'default',
    });
  }

  return result;
};

// Накопительные смещения страниц в системе координат прокручиваемого контента.
// pageGap дублирует CSS-зазор между страницами (--turn-widget-pdf-page-gap).
export const getPageOffsets = (pages, pageWidth, pageGap, crop = null) => {
  let top = 0;
  return pages.map((page, index) => {
    const height = getPageBoxHeight(pageWidth, page.aspect, crop);
    const offset = { top: index === 0 ? 0 : top, height };
    top = offset.top + height + pageGap;
    return offset;
  });
};

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

    const quoteTop = pageOffset.top + (pageOffset.height * quote.y) / 100;
    const quoteHeight = (pageOffset.height * quote.height) / 100;
    const quoteBottom = quoteTop + quoteHeight;

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

    result.push({
      ...base,
      left: Math.round(widgetLeft + (pageWidth * quote.x) / 100),
      top: Math.round(widgetTop + visibleTop - scrollTop),
      width: Math.round((pageWidth * quote.width) / 100),
      height: Math.round(visibleHeight),
      position: 'default',
    });
  }

  return result;
};

// Накопительные смещения страниц в системе координат прокручиваемого контента.
// pageGap дублирует CSS-зазор между страницами (--turn-widget-pdf-page-gap).
export const getPageOffsets = (pages, pageWidth, pageGap) => {
  let top = 0;
  return pages.map((page, index) => {
    const height = Math.round(pageWidth * page.aspect);
    const offset = { top: index === 0 ? 0 : top, height };
    top = offset.top + height + pageGap;
    return offset;
  });
};

import { TURN_BORDER_THICKNESS, widgetSpacer } from '@/config/ui';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import { relativeRect } from '@/modules/game/components/helpers/zoom';

export const getParagraphQuotesWithoutScroll = (
  turnId,
  paragraphEl,
  zoom = 1,
) => {
  // span у абзаца, mark у md-статьи; других [data-id] внутри тела нет
  const quoteEls = [
    ...paragraphEl.current.querySelectorAll('[data-id]:not([data-id=""])'),
  ];
  // const quoteEls = spans.filter((span) => !!span.getAttribute('data-id'));
  const paragraphLeftPadding = 6; // @todo: get from size settings

  // const turnElRect = paragraphEl.current.parentElement.getBoundingClientRect();

  const quotes = [];

  for (let quoteEl of quoteEls) {
    const rect = relativeRect(quoteEl, paragraphEl.current, zoom);
    let left = Math.round(rect.left) + paragraphLeftPadding; // КРАСНАЯ РАМКА
    let top = Math.round(rect.top * 100) / 100 + 2;
    let width = Math.round(rect.width);
    let height = Math.round(rect.height * 100) / 100;

    const quoteId = quoteEl.getAttribute('data-id') || new Date().getTime();

    const initialCoords = {
      left,
      top: top + paragraphEl.current.scrollTop,
      width,
      height,
    };

    quotes.push({
      initialCoords,
      quoteId,
      quoteKey: `${turnId}_${quoteId}`,
      turnId,
      text: quoteEl.textContent.trim(),
    });
  }
  return quotes;
};

const QUOTE_MIN_HEIGHT_DELTA = 40;

const bodyRectOf = (paragraphEl, zoom) => {
  const bodyRect = relativeRect(
    paragraphEl.current,
    paragraphEl.current.parentNode.parentNode,
    zoom,
  );
  // Высота тела округляется так же, как координаты цитат выше: иначе цитата в последней
  // строке вплотную к краю (104,86 против 104,859375) считалась ушедшей за нижний край.
  return {
    ...bodyRect,
    height: Math.round(bodyRect.height * 100) / 100,
  };
};

// Полоска у верхнего или нижнего края тела — цитата, ушедшая за край.
const edgeCoords = (paragraphRect, position) => {
  const outlineWidth = TURN_BORDER_THICKNESS;
  return {
    height: 0,
    width: paragraphRect.width + 2 * outlineWidth - 2 * widgetSpacer, // 2 ширины рамки
    left: outlineWidth + widgetSpacer,
    top:
      position === 'top'
        ? paragraphRect.top - widgetSpacer - 2
        : paragraphRect.top + paragraphRect.height + outlineWidth + widgetSpacer - 2,
    position,
  };
};

// Записи цитат, узлов которых в теле нет (часть вне окна ленивой отрисовки): сразу полоска у края.
// edge — [{ quoteId, text, position: 'top' | 'bottom' }].
export const getEdgeQuotes = (edge, turnId, paragraphEl, zoom = 1) => {
  if (!edge?.length) return [];
  const paragraphRect = bodyRectOf(paragraphEl, zoom);
  return edge.map(({ quoteId, text, position }) => ({
    quoteId,
    quoteKey: `${turnId}_${quoteId}`,
    turnId,
    text,
    type: TYPE_QUOTE_TEXT,
    ...edgeCoords(paragraphRect, position),
  }));
};

export const getScrolledQuotes = (
  quotes,
  paragraphEl,
  passedScrollPosition,
  zoom = 1,
) => {
  const paragraphRect = bodyRectOf(paragraphEl, zoom);
  const topGap = paragraphRect.top;

  return quotes.map((quote) => {
    let { width, height, left, top } = quote.initialCoords;

    let position = 'default';
    const outlineWidth = TURN_BORDER_THICKNESS; // ещё в Turn.js строчка 466
    let scrollPosition = passedScrollPosition || 0;

    if (top + outlineWidth < scrollPosition) {
      if (top + height - outlineWidth > paragraphRect.height + scrollPosition) {
        top = topGap;
        height = paragraphRect.height;
      } else if (
        top + outlineWidth >
        scrollPosition - height + QUOTE_MIN_HEIGHT_DELTA
      ) {
        height = height + (top + outlineWidth - scrollPosition) - 2;
        top = topGap;
      } else {
        ({ height, width, left, top, position } = edgeCoords(paragraphRect, 'top'));
      }
    } else if (
      top + height - outlineWidth >
      paragraphRect.height + scrollPosition
    ) {
      if (
        top + height - outlineWidth <
        paragraphRect.height + scrollPosition + height - QUOTE_MIN_HEIGHT_DELTA
      ) {
        top = top + topGap - scrollPosition - outlineWidth;
        const bottom = topGap + paragraphRect.height + outlineWidth - 2;
        height = bottom - top;
      } else {
        ({ height, width, left, top, position } = edgeCoords(paragraphRect, 'bottom'));
      }
    } else {
      top = top + topGap - scrollPosition - outlineWidth; // положение красной рамки вокруг цитаты по вертикали
    }

    return {
      ...quote,
      type: TYPE_QUOTE_TEXT,
      width,
      height,
      left,
      top,
      position,
    };
  });
};

// Цитаты окошка сжатой статьи или перевода: windowEl — скроллер окошка, origin — внутренняя карточка
// (от неё считаются рамки). Цитата режется по краю окошка; ушла за край целиком — рамка нулевой
// высоты у этого края, как у сжатого абзаца.
export const getWindowQuotes = (quotes, windowEl, origin, zoom = 1) => {
  const rect = relativeRect(windowEl, origin, zoom);
  const edgeTop = Math.round(rect.top * 100) / 100;
  const edgeBottom = edgeTop + Math.round(rect.height * 100) / 100;
  const scrollPosition = windowEl.scrollTop;

  return quotes.map((quote) => {
    const { width, left } = quote.initialCoords;
    let { height } = quote.initialCoords;
    let top = quote.initialCoords.top + edgeTop - scrollPosition - TURN_BORDER_THICKNESS;
    let position = 'default';
    if (top + height <= edgeTop) {
      top = edgeTop + 1;
      height = 0;
      position = 'top';
    } else if (top >= edgeBottom) {
      top = edgeBottom - 1;
      height = 0;
      position = 'bottom';
    } else {
      if (top < edgeTop) {
        height -= edgeTop - top;
        top = edgeTop;
      }
      if (top + height > edgeBottom) height = edgeBottom - top;
    }
    return {
      ...quote,
      type: TYPE_QUOTE_TEXT,
      width,
      height,
      left,
      top,
      position,
    };
  });
};

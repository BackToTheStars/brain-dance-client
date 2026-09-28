import { TURN_BORDER_THICKNESS, widgetSpacer } from '@/config/ui';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import { relativeRect } from '@/modules/game/components/helpers/zoom';

export const getParagraphQuotesWithoutScroll = (
  turnId,
  paragraphEl,
  zoom = 1,
) => {
  const quoteEls = [
    ...paragraphEl.current.querySelectorAll('span[data-id]:not([data-id=""])'),
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

export const getScrolledQuotes = (
  quotes,
  paragraphEl,
  passedScrollPosition,
  zoom = 1,
) => {
  const paragraphRect = relativeRect(
    paragraphEl.current,
    paragraphEl.current.parentNode.parentNode,
    zoom,
  );
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
        height = 0;
        width = paragraphRect.width + 2 * outlineWidth - 2 * widgetSpacer; // 2 ширины рамки
        left = outlineWidth + widgetSpacer; //left + outlineWidth;
        top = topGap - widgetSpacer - 2; //top + outlineWidth;
        position = 'top';
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
        height = 0;
        width = paragraphRect.width + 2 * outlineWidth - 2 * widgetSpacer;
        left = outlineWidth + widgetSpacer;
        top = topGap + paragraphRect.height + outlineWidth + widgetSpacer - 2;
        position = 'bottom';
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

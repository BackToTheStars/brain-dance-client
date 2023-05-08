// export const getParagraphQoutesFromDomOld = (turnId, paragraphEl) => {
//   const spans = [...paragraphEl.current.querySelectorAll('span')];
//   const quoteEls = spans.filter((span) => !!span.getAttribute('data-id'));
//   const paragraphRect = paragraphEl.current.getBoundingClientRect();
//   const turnElRect = paragraphEl.current.parentElement.getBoundingClientRect();
//   const quotes = [];
//   for (let quoteEl of quoteEls) {
//     const rect = quoteEl.getBoundingClientRect();
//     let left = rect.left - turnElRect.left;
//     let top = rect.top - turnElRect.top;
//     let width = rect.width;
//     let height = rect.height;

import { TURN_BORDER_THICKNESS, widgetSpacer } from '@/config/ui';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';

//     let position = 'default';
//     const outlineWidth = 2; // ещё в Turn.js строчка 466

//     const initialCoords = { left, top, width, height };

//     if (rect.top + rect.height / 2 < paragraphRect.top) {
//       //
//       height = 0;
//       width = paragraphRect.width - outlineWidth; // 2 ширины рамки
//       left = paragraphRect.left - turnElRect.left + outlineWidth;
//       top = paragraphRect.top - turnElRect.top + outlineWidth;
//       position = 'top';
//       //
//     } else if (
//       rect.top + rect.height / 2 >
//       paragraphRect.top + paragraphRect.height
//     ) {
//       height = 0;
//       width = paragraphRect.width - outlineWidth;
//       left = paragraphRect.left - turnElRect.left + outlineWidth;
//       top =
//         paragraphRect.top +
//         paragraphRect.height -
//         turnElRect.top +
//         outlineWidth;
//       position = 'bottom';
//     }

//     // const quoteId = quoteEl.attributes.id || new Date().getTime(); // ???
//     const quoteId = quoteEl.getAttribute('data-id') || new Date().getTime();
//     quotes.push({
//       initialCoords,
//       quoteId,
//       quoteKey: `${turnId}_${quoteId}`,
//       turnId,
//       width,
//       height,
//       left,
//       top,
//       text: quoteEl.textContent.trim(), // !!!
//       position,
//     });
//   }
//   return quotes;
// };

export const getParagraphQuotesWithoutScroll = (turnId, paragraphEl) => {
  const spans = [...paragraphEl.current.querySelectorAll('span')];
  const quoteEls = spans.filter((span) => !!span.getAttribute('data-id'));

  const paragraphRect = paragraphEl.current.getBoundingClientRect();
  // const turnElRect = paragraphEl.current.parentElement.getBoundingClientRect();

  const quotes = [];

  for (let quoteEl of quoteEls) {
    const rect = quoteEl.getBoundingClientRect();
    let left = Math.round(rect.left - paragraphRect.left); // КРАСНАЯ РАМКА
    let top = Math.round((rect.top - paragraphRect.top) * 100) / 100;
    let width = Math.round(rect.width);
    let height = Math.round(rect.height * 100) / 100;

    const quoteId = quoteEl.getAttribute('data-id') || new Date().getTime();

    const initialCoords = {
      left,
      top: top, // + paragraphEl.current.scrollTop,
      width,
      height,
    };

    quotes.push({
      initialCoords,
      quoteId,
      quoteKey: `${turnId}_${quoteId}`,
      turnId,
      // width,
      // height,
      // left,
      // top,
      text: quoteEl.textContent.trim(), // !!!
      // position,
    });
  }
  return quotes;
};

export const getScrolledQuotes = (
  quotes,
  paragraphEl,
  passedScrollPosition
) => {
  const paragraphRect = paragraphEl.current.getBoundingClientRect();
  const turnRect =
    paragraphEl.current.parentNode.parentNode.getBoundingClientRect();
  const topGap = paragraphRect.top - turnRect.top;

  return quotes.map((quote) => {
    let { width, height, left, top } = quote.initialCoords;

    let position = 'default';
    const outlineWidth = TURN_BORDER_THICKNESS; // ещё в Turn.js строчка 466
    let scrollPosition = passedScrollPosition || 0;

    if (top + outlineWidth < scrollPosition) {
      // height / 2
      height = 0;
      width = paragraphRect.width + 2 * outlineWidth - 2 * widgetSpacer; // 2 ширины рамки
      left = outlineWidth + widgetSpacer; //left + outlineWidth;
      top = topGap - widgetSpacer - 2; //top + outlineWidth;
      position = 'top';
    } else if (
      top + height - outlineWidth >
      paragraphRect.height + scrollPosition
    ) {
      // height / 2
      height = 0;
      width = paragraphRect.width + 2 * outlineWidth - 2 * widgetSpacer;
      left = outlineWidth + widgetSpacer;
      top = topGap + paragraphRect.height + outlineWidth + widgetSpacer - 2;
      position = 'bottom';
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

// Прокручиваемое тело с текстовыми цитатами — общее у абзаца, md-статьи и перевода: замер рамок
// [data-id] и концов линий, перемер при ресайзе и смене содержимого, запись и восстановление прокрутки.

import {
  PARAGRAPH_SCROLL_TIMEOUT_DELAY,
  TURN_SCROLL_TIMEOUT_DELAY,
} from '@/config/ui';
import { TURN_SIZE_MIN_WIDTH } from '@/config/turn';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { updateScrollPosition } from '@/modules/turns/redux/actions';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { getQueue } from '../helpers/queueHelper';
import {
  getEdgeQuotes,
  getParagraphQuotesWithoutScroll,
  getScrolledQuotes,
} from '../helpers/quotesHelper';
import { placePart, topPart } from './parts/middleRow';
import { partsOf } from './parts/useVisibleParts';

const paragraphScrollQueue = getQueue(PARAGRAPH_SCROLL_TIMEOUT_DELAY);
const turnScrollQueue = getQueue(TURN_SCROLL_TIMEOUT_DELAY);

// bodyRef — скроллер (его дед — внутренняя карточка .stb-react-turn__inner);
// quotesSignature — id цитат содержимого, пусто — цитат нет; contentKey — строка,
// меняющаяся вместе с содержимым; scrollPosition — записанная позиция из виджета;
// ready — содержимое разложено в DOM: до этого виджет для ресайза не регистрируется
// (пустое тело давало бы scrollHeight 0, и карточка зажималась бы к минимуму);
// minWidth — минимальная ширина карточки от этого виджета; ownScrollRef — ref с последним
// scrollTop, выставленным самим содержимым (сдвиг заглушек ленивой сетки): такая прокрутка не
// пользовательская — не отменяет восстановление и не пишется в позицию.
// Тело с ленивыми частями (перевод) передаёт ещё edgeQuotes — цитаты частей, которых нет в DOM
// ([{ quoteId, text, position }], см. getEdgeQuotes; [] — таких нет), и layoutKey — значение,
// меняющееся со сменой набора отрисованных частей: рамки тогда перемеряются по DOM.
// sizeKey — смена перерегистрирует виджет: карточка пересчитывает высоту по новому содержимому.
// Сжатый ход (окошки со своей прокруткой, QuoteWindows.js): paused — тело рамок не меряет, свою
// прокрутку не пишет и не восстанавливает (после паузы возвращается на прежнее место: к ряду, что был
// у верхнего края, — пиксели на оценках высот ленивых рядов привели бы к другому ряду); fixedHeight —
// ref с высотой тела, пока она задана содержимым (сумма окошек): тогда min = max = она.
export const useQuotedBody = ({
  turnId,
  widgetId,
  resizeType,
  bodyRef,
  widgetsUpdatedTime,
  quotesSignature,
  contentKey,
  scrollPosition,
  registerHandleResize,
  unregisterHandleResize,
  ready = true,
  minWidth = TURN_SIZE_MIN_WIDTH,
  ownScrollRef = null,
  edgeQuotes,
  layoutKey,
  sizeKey,
  paused = false,
  fixedHeight = null,
}) => {
  const quotesDataRef = useRef(null);
  const pausedRef = useRef(paused);
  // место тела читается до того, как его содержимое сменится окошками
  const anchorRef = useRef(null);
  if (paused && !pausedRef.current) anchorRef.current = topPart(bodyRef.current);
  pausedRef.current = paused;
  const size = useSelector((state) => state.turns.g[turnId].size);
  const { width, height } = size;

  // цель восстановления прокрутки, которую пока не удалось применить (см. ниже),
  // и последнее значение, выставленное нами, — чтобы отличить свою прокрутку от ручной
  const pendingScrollRef = useRef(null);
  const lastAppliedRef = useRef(null);
  const dispatch = useDispatch();
  const store = useStore();
  const zoom = () => store.getState().game.zoom;
  const lazy = edgeQuotes !== undefined;
  const scrolledOf = (quotes, top) => {
    const scrolled = getScrolledQuotes(quotes, bodyRef, top, zoom());
    return edgeQuotes?.length
      ? [...scrolled, ...getEdgeQuotes(edgeQuotes, turnId, bodyRef, zoom())]
      : scrolled;
  };

  const [scrollTop, setScrollTop] = useState(0); // дополнительный локальный стейт для быстрого ререндера цитат

  useEffect(() => {
    if (!bodyRef.current) return;
    if (paused) {
      // после паузы рамки меряются заново, как при первой отрисовке
      quotesDataRef.current = null;
      return;
    }
    let needToUpdate = false;
    let widthChanged = false;
    let firstRender = false;
    if (!quotesDataRef.current || widgetsUpdatedTime) {
      firstRender = true;
      needToUpdate = true;
      const quotesWithoutScroll = getParagraphQuotesWithoutScroll(
        turnId,
        bodyRef,
        zoom(),
      );
      quotesDataRef.current = {
        turnEl: bodyRef.current.closest('.stb-react-turn'),
        width,
        height,
        scrollTop,
        quotesWithoutScroll,
        scrolledQuotes: scrolledOf(quotesWithoutScroll, scrollTop),
      };
    }
    if (!quotesDataRef.current.turnEl) {
      quotesDataRef.current.turnEl = bodyRef.current.closest('.stb-react-turn');
    }

    if (width !== quotesDataRef.current.width) {
      needToUpdate = true;
      widthChanged = true;
      quotesDataRef.current.width = width;
      quotesDataRef.current.quotesWithoutScroll =
        getParagraphQuotesWithoutScroll(turnId, bodyRef, zoom());
    }

    if (
      widthChanged ||
      height !== quotesDataRef.current.height ||
      scrollTop !== quotesDataRef.current.scrollTop
    ) {
      needToUpdate = true;
      quotesDataRef.current.height = height;
      quotesDataRef.current.scrollTop = scrollTop;
      quotesDataRef.current.scrolledQuotes = scrolledOf(
        quotesDataRef.current.quotesWithoutScroll,
        scrollTop,
      );
    }

    if (
      !firstRender &&
      (quotesDataRef.current.contentKey !== contentKey ||
        quotesDataRef.current.layoutKey !== layoutKey ||
        quotesDataRef.current.edgeQuotes !== edgeQuotes)
    ) {
      needToUpdate = true;
      quotesDataRef.current.quotesWithoutScroll =
        getParagraphQuotesWithoutScroll(turnId, bodyRef, zoom());
      quotesDataRef.current.scrolledQuotes = scrolledOf(
        quotesDataRef.current.quotesWithoutScroll,
        scrollTop,
      );
    }
    quotesDataRef.current.contentKey = contentKey;
    quotesDataRef.current.layoutKey = layoutKey;
    quotesDataRef.current.edgeQuotes = edgeQuotes;

    if (needToUpdate) {
      if (!quotesDataRef.current.scrolledQuotes?.length) {
        // у ленивого тела узлов цитат может не быть и при непустой подписи: все они вне окна
        if (!quotesSignature || lazy) {
          // последнюю цитату сняли — её рамка уходит вместе с ней
          if (store.getState().lines.quotesInfo[turnId]?.[widgetId]?.length) {
            dispatch(quoteCoordsUpdate(turnId, widgetId, []));
          }
          return;
        }
        // Цитаты ожидаются (есть в контенте), но их узлы ещё не разложены в DOM —
        // повторяем замер на следующем кадре. Один rAF; гард от повторного планирования.
        if (!quotesDataRef.current.remeasureRaf) {
          quotesDataRef.current.remeasureRaf = requestAnimationFrame(() => {
            quotesDataRef.current.remeasureRaf = null;
            if (!bodyRef.current) return;
            const quotesWithoutScroll = getParagraphQuotesWithoutScroll(
              turnId,
              bodyRef,
              zoom(),
            );
            const scrolledQuotes = scrolledOf(quotesWithoutScroll, scrollTop);
            quotesDataRef.current.quotesWithoutScroll = quotesWithoutScroll;
            quotesDataRef.current.scrolledQuotes = scrolledQuotes;
            if (scrolledQuotes?.length) {
              dispatch(quoteCoordsUpdate(turnId, widgetId, scrolledQuotes));
            }
          });
        }
        return;
      }
      if (firstRender) {
        dispatch(
          quoteCoordsUpdate(
            turnId,
            widgetId,
            quotesDataRef.current.scrolledQuotes,
          ),
        );
      } else {
        quotesDataRef.current.turnEl.classList.add('quotes-queued');
        turnScrollQueue.add(() => {
          dispatch(
            quoteCoordsUpdate(
              turnId,
              widgetId,
              quotesDataRef.current.scrolledQuotes,
            ),
          );
          quotesDataRef.current.turnEl.classList.remove('quotes-queued');
        });
      }
    }
  }, [
    width,
    height,
    scrollTop,
    bodyRef.current,
    widgetsUpdatedTime,
    contentKey,
    layoutKey,
    edgeQuotes,
    paused,
  ]);

  // Коробку тела меняют и мимо зависимостей эффекта выше — разделитель pdf, заголовок:
  // рамки и концы линий перемеряются в том же кадре.
  const remeasureRef = useRef(null);
  remeasureRef.current = () => {
    const el = bodyRef.current;
    if (!el || !quotesDataRef.current || !quotesSignature) return;
    const quotesWithoutScroll = getParagraphQuotesWithoutScroll(
      turnId,
      bodyRef,
      zoom(),
    );
    const scrolledQuotes = scrolledOf(quotesWithoutScroll, el.scrollTop);
    if (!scrolledQuotes.length && !lazy) return;
    quotesDataRef.current.quotesWithoutScroll = quotesWithoutScroll;
    quotesDataRef.current.scrolledQuotes = scrolledQuotes;
    dispatch(quoteCoordsUpdate(turnId, widgetId, scrolledQuotes));
  };

  useEffect(() => {
    if (!bodyRef || !bodyRef.current) return;

    const scrollHandler = () => {
      if (pausedRef.current) return;
      if (!!bodyRef.current) {
        const current = Math.round(bodyRef.current.scrollTop);
        if (ownScrollRef && current === ownScrollRef.current) {
          ownScrollRef.current = null;
          setScrollTop(bodyRef.current.scrollTop);
          return;
        }
        // прокрутил пользователь, а не мы — отменяем отложенное восстановление
        if (current !== lastAppliedRef.current) {
          pendingScrollRef.current = null;
        }
        setScrollTop(bodyRef.current.scrollTop);
        // зажатое значение недовосстановленной прокрутки — не правка: не в стор и не в запись
        if (pendingScrollRef.current != null) return;

        paragraphScrollQueue.add(() => {
          dispatch(
            updateScrollPosition({
              turnId,
              widgetId,
              scrollPosition: Math.floor(bodyRef.current.scrollTop),
            }),
          );
        });
      }
    };

    bodyRef.current.addEventListener('scroll', scrollHandler);

    return () => {
      if (!!bodyRef.current)
        bodyRef.current.removeEventListener('scroll', scrollHandler);
    };
  }, [bodyRef]);

  useEffect(() => {
    if (!ready || !bodyRef || !bodyRef.current) return;
    const scrollHeight = bodyRef?.current?.scrollHeight;
    const resizeInfo = {
      id: widgetId,
      type: resizeType,
      minWidthCallback: () => minWidth,
      minHeightCallback: () => fixedHeight?.current ?? 40,
      getDesiredHeight: ({ newHeight }) => {
        return newHeight;
      },
      maxHeightCallback: () => {
        return fixedHeight?.current ?? (bodyRef?.current?.scrollHeight || scrollHeight);
      },
    };
    registerHandleResize(resizeInfo);
    return () => unregisterHandleResize({ id: widgetId });
  }, [bodyRef, ready, sizeKey]);

  // ВОССТАНОВЛЕНИЕ ПРОКРУТКИ
  // Позиция приходит с сервера раньше, чем загрузится картинка хода: пока её нет,
  // тело выше итогового, и браузер зажимает scrollTop по текущему scrollHeight.
  // Когда картинка доезжает и тело уменьшается, повторно применить позицию
  // некому — текст оставался не на том месте (расхождение доходило до сотен пикселей).
  // Поэтому недостигнутую цель держим в pendingScrollRef и повторяем на ресайзе.
  const applyScroll = useCallback((target) => {
    const el = bodyRef.current;
    if (!el || target == null) return;
    el.scrollTop = target;
    lastAppliedRef.current = Math.round(el.scrollTop);
    pendingScrollRef.current =
      lastAppliedRef.current < Math.round(target) ? target : null;
  }, []);

  useEffect(() => {
    if (!bodyRef.current || paused) return;
    if (scrollTop !== scrollPosition) {
      applyScroll(scrollPosition);
    }
  }, [scrollPosition]);

  // Выход из паузы: тело — туда, где его оставили до неё. Ряд верхнего края не запомнен (ход открыт
  // уже сжатым) или его больше нет — по позиции в пикселях (несохранённая — в сторе).
  const wasPaused = useRef(paused);
  useEffect(() => {
    if (wasPaused.current === paused) return undefined;
    wasPaused.current = paused;
    if (paused) return undefined;
    const byPixels = () => {
      const kept =
        store.getState().turns.scrollPositions?.[`${turnId}_${widgetId}`]?.scrollPosition;
      applyScroll(kept ?? scrollPosition);
    };
    const anchor = anchorRef.current;
    anchorRef.current = null;
    const parts = anchor && partsOf(bodyRef.current);
    if (!parts) {
      byPixels();
      return undefined;
    }
    let alive = true;
    pendingScrollRef.current = null;
    placePart(bodyRef.current, parts.scrollToPart, anchor).then((found) => {
      if (alive && !found && !pausedRef.current) byPixels();
    });
    return () => {
      alive = false;
    };
  }, [paused]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (pausedRef.current) return;
      if (pendingScrollRef.current != null) {
        applyScroll(pendingScrollRef.current);
      }
      remeasureRef.current();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // содержимое доехало позже позиции (ленивый рендер ячеек): коробка тела не
  // меняется, наблюдатель молчит — довосстановить зажатую цель здесь. Один раз:
  // дальнейшая правка содержимого прокрутку не двигает
  const contentArrivedRef = useRef(false);
  useEffect(() => {
    if (!contentKey || contentArrivedRef.current || paused) return;
    contentArrivedRef.current = true;
    if (pendingScrollRef.current != null) applyScroll(pendingScrollRef.current);
  }, [contentKey]);
};

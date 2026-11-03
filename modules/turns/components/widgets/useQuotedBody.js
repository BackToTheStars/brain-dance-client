// Прокручиваемое тело с текстовыми цитатами — общее у абзаца и md-статьи: замер рамок
// [data-id] и концов линий, перемер при ресайзе, разделителе и смене содержимого,
// прокрутка с записью позиции и её восстановлением, регистрация ресайза виджета.
// Код перенесён из ParagraphOriginal без изменения поведения.

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
  getParagraphQuotesWithoutScroll,
  getScrolledQuotes,
} from '../helpers/quotesHelper';

const paragraphScrollQueue = getQueue(PARAGRAPH_SCROLL_TIMEOUT_DELAY);
const turnScrollQueue = getQueue(TURN_SCROLL_TIMEOUT_DELAY);

// bodyRef — скроллер (его дед — внутренняя карточка .stb-react-turn__inner);
// quotesSignature — id цитат содержимого, пусто — цитат нет; contentKey — строка,
// меняющаяся вместе с содержимым; scrollPosition — записанная позиция из виджета;
// ready — содержимое разложено в DOM: до этого виджет для ресайза не регистрируется
// (пустое тело давало бы scrollHeight 0, и карточка зажималась бы к минимуму).
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
}) => {
  const quotesDataRef = useRef(null);
  const size = useSelector((state) => state.turns.g[turnId].size);
  const { width, height } = size;

  // цель восстановления прокрутки, которую пока не удалось применить (см. ниже),
  // и последнее значение, выставленное нами, — чтобы отличить свою прокрутку от ручной
  const pendingScrollRef = useRef(null);
  const lastAppliedRef = useRef(null);
  const dispatch = useDispatch();
  const store = useStore();
  const zoom = () => store.getState().game.zoom;

  const [scrollTop, setScrollTop] = useState(0); // дополнительный локальный стейт для быстрого ререндера цитат

  useEffect(() => {
    if (!bodyRef.current) return;
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
        scrolledQuotes: getScrolledQuotes(
          quotesWithoutScroll,
          bodyRef,
          scrollTop,
          zoom(),
        ),
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
      quotesDataRef.current.scrolledQuotes = getScrolledQuotes(
        quotesDataRef.current.quotesWithoutScroll,
        bodyRef,
        scrollTop,
        zoom(),
      );
    }

    if (!firstRender && quotesDataRef.current.contentKey !== contentKey) {
      needToUpdate = true;
      quotesDataRef.current.quotesWithoutScroll =
        getParagraphQuotesWithoutScroll(turnId, bodyRef, zoom());
      quotesDataRef.current.scrolledQuotes = getScrolledQuotes(
        quotesDataRef.current.quotesWithoutScroll,
        bodyRef,
        scrollTop,
        zoom(),
      );
    }
    quotesDataRef.current.contentKey = contentKey;

    if (needToUpdate) {
      if (!quotesDataRef.current.scrolledQuotes?.length) {
        if (!quotesSignature) {
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
            const scrolledQuotes = getScrolledQuotes(
              quotesWithoutScroll,
              bodyRef,
              scrollTop,
              zoom(),
            );
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
  }, [width, height, scrollTop, bodyRef.current, widgetsUpdatedTime, contentKey]);

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
    const scrolledQuotes = getScrolledQuotes(
      quotesWithoutScroll,
      bodyRef,
      el.scrollTop,
      zoom(),
    );
    if (!scrolledQuotes.length) return;
    quotesDataRef.current.quotesWithoutScroll = quotesWithoutScroll;
    quotesDataRef.current.scrolledQuotes = scrolledQuotes;
    dispatch(quoteCoordsUpdate(turnId, widgetId, scrolledQuotes));
  };

  useEffect(() => {
    if (!bodyRef || !bodyRef.current) return;

    const scrollHandler = () => {
      if (!!bodyRef.current) {
        // прокрутил пользователь, а не мы — отменяем отложенное восстановление
        if (Math.round(bodyRef.current.scrollTop) !== lastAppliedRef.current) {
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
      minWidthCallback: () => TURN_SIZE_MIN_WIDTH,
      minHeightCallback: () => 40,
      getDesiredHeight: ({ newHeight }) => {
        return newHeight;
      },
      maxHeightCallback: () => {
        return bodyRef?.current?.scrollHeight || scrollHeight;
      },
    };
    registerHandleResize(resizeInfo);
    return () => unregisterHandleResize({ id: widgetId });
  }, [bodyRef, ready]);

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
    if (!bodyRef.current) return;
    if (scrollTop !== scrollPosition) {
      applyScroll(scrollPosition);
    }
  }, [scrollPosition]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (pendingScrollRef.current != null) {
        applyScroll(pendingScrollRef.current);
      }
      remeasureRef.current();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
};

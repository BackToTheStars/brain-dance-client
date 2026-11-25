// Хук «окно прокрутки → id частей к отрисовке». Слушает scroll скроллера (пересчёт раз в кадр),
// меряет отрисованные части ResizeObserver'ом и помнит высоты по id, оценивает невидимые,
// калибрует оценку по первым замеренным частям и сдвигает scrollTop, когда части выше окна
// сменили высоту, — в том же кадре, до отрисовки (ResizeObserver и useLayoutEffect идут после
// вёрстки и до рисования). Смена ширины скроллера сбрасывает замеры: их делали при другой ширине.

import { useCallback, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { layoutOffsets, sameParts, scrollShift, visibleParts } from './layout';

// Коробка скроллера до первого замера: нужна только первому рендеру, его заменит
// useLayoutEffect до рисования.
const DEFAULT_BOX = { width: 600, viewport: 600, fontSize: 18, lineHeight: 24 };

// Скроллер → { scrollToPart }: переход из навигатора находит тело карточки в DOM, а не в сторе.
const scrollers = new WeakMap();
export const partsOf = (el) => (el && scrollers.get(el)) || null;

// Тело, чьи части лежат во вложенных скроллерах (окошки сжатого хода), отвечает за них само:
// api — { scrollToPart }. Ответ — снятие записи.
export const registerParts = (el, api) => {
  scrollers.set(el, api);
  return () => {
    if (scrollers.get(el) === api) scrollers.delete(el);
  };
};

// Сколько кадров ждать отрисовки и замера части и сколько раз доводить её до места.
const SCROLL_FRAMES = 60;
const SCROLL_FIXES = 3;

// Верх элемента от верха содержимого скроллера в его пикселях (тело может стоять под CSS zoom).
const topInScroller = (scroller, el) => {
  const box = scroller.getBoundingClientRect();
  const scale = box.height && scroller.offsetHeight ? scroller.offsetHeight / box.height : 1;
  const padding = parseFloat(getComputedStyle(scroller).paddingTop) || 0;
  return (el.getBoundingClientRect().top - box.top) * scale - scroller.clientTop - padding;
};

export const readBox = (el) => {
  const style = getComputedStyle(el);
  const fontSize = parseFloat(style.fontSize) || DEFAULT_BOX.fontSize;
  return {
    width:
      el.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0),
    viewport: el.clientHeight,
    fontSize,
    lineHeight: parseFloat(style.lineHeight) || fontSize * 1.2,
  };
};

// scrollRef — ref скроллера (overflow-y); ids — упорядоченные id частей; estimate(id, box) — оценка
// высоты части в px при коробке скроллера { width — ширина содержимого, viewport, fontSize,
// lineHeight }; always — id, которые рисуются всегда (массив или Set); ownScrollRef — ref, куда
// пишется scrollTop, выставленный хуком (скроллер отличает свой сдвиг от прокрутки пользователя).
// Ответ: visible — Set id к отрисовке; heightOf(id) — высота части вне окна (замер или оценка);
// measureRef(id) — ref-колбэк на корень отрисованной части; box — текущая коробка;
// scrollToPart(id) — см. ниже. startAt — id части, на которую скроллер ставится при первой отрисовке
// (её верх — в середине окна): ряды возле неё рисуются сразу, без кадра с разделителем.
// onMeasure() — отрисованная часть сменила высоту.
export const useVisibleParts = ({ scrollRef, ids, estimate, always, ownScrollRef, layoutKey, startAt, onMeasure }) => {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const own = useRef(null);
  const ownRef = ownScrollRef || own;
  const state = useRef(null);
  if (!state.current) {
    state.current = {
      heights: new Map(), // замеры по id
      estimates: new Map(), // сырые оценки по id при текущих коробке и функции оценки
      applied: new Map(), // высота, которую часть имеет в документе сейчас
      box: DEFAULT_BOX,
      scale: 1,
      calibrated: false,
      keepScroll: false,
      visible: new Set(),
      refs: new Map(), // ref-колбэки по id, одни на жизнь части
      attached: new Map(), // id → отрисованный элемент
      elements: new WeakMap(), // элемент → id
      observer: null,
      raf: 0,
    };
  }
  const s = state.current;
  // Те же id, но другой способ отображения (Visual / Source): ни замеры, ни
  // калибровка прежнего редактора не описывают новую высоту рядов.
  if (s.layoutKey !== layoutKey) {
    s.layoutKey = layoutKey;
    s.heights.clear();
    s.estimates.clear();
    s.applied.clear();
    s.scale = 1;
    s.calibrated = false;
    s.keepScroll = true;
  }
  s.ids = ids;
  if (s.estimate !== estimate) s.estimates.clear();
  s.estimate = estimate;
  s.always = always;
  s.onMeasure = onMeasure;

  // Оценка считается раз на часть, пока не сменились коробка или функция оценки: за шаг прокрутки
  // к heightOf обращаются несколько раз на каждую часть вне окна.
  const heightOf = useCallback((id) => {
    const measured = s.heights.get(id);
    if (measured !== undefined) return measured;
    let raw = s.estimates.get(id);
    if (raw === undefined) {
      raw = s.estimate(id, s.box);
      s.estimates.set(id, raw);
    }
    return Math.max(1, Math.round(raw * s.scale));
  }, []);

  const setBox = (box) => {
    s.box = box;
    s.estimates.clear();
  };

  const shiftBy = (el, shift) => {
    if (!shift) return;
    el.scrollTop += shift;
    ownRef.current = Math.round(el.scrollTop);
  };

  // Тело без своей высоты (её задаёт содержимое, а его ещё нет — новая карточка) — окно по коробке
  // по умолчанию: при нулевом окне рисовался бы один разделитель оценок.
  const viewportOf = () => s.box.viewport || DEFAULT_BOX.viewport;

  // Без скроллера окна нет — рисуется всё.
  const compute = () => {
    const el = scrollRef?.current;
    const visible = el
      ? visibleParts({
          ids: s.ids,
          heightOf,
          scrollTop: el.scrollTop,
          viewportHeight: viewportOf(),
          always: s.always,
        }).visible
      : new Set(s.ids);
    if (!sameParts(visible, s.visible)) {
      s.visible = visible;
      rerender();
    }
  };

  // Первый рендер со скроллером — сразу окно, а не один разделитель оценок: новая карточка зажимает
  // свою высоту по scrollHeight тела в эффектах этого же коммита, и ход с недооценённым блоком
  // (список) оставался ниже содержимого.
  if (!s.primed && scrollRef?.current) {
    s.primed = true;
    setBox(readBox(scrollRef.current));
    const start = startAt === undefined ? -1 : s.ids.indexOf(startAt);
    s.start =
      start < 0
        ? null
        : Math.max(0, Math.round(layoutOffsets(s.ids, heightOf).tops[start] - viewportOf() / 2));
    s.visible = visibleParts({
      ids: s.ids,
      heightOf,
      scrollTop: s.start === null ? scrollRef.current.scrollTop : s.start,
      viewportHeight: viewportOf(),
      always: s.always,
    }).visible;
  }

  // Замер отрисованных частей. Калибровка — один раз, по первой пачке замеров: отношение их суммы
  // к сумме сырых оценок, дальше оценки умножаются на него. До калибровки scrollTop не сдвигается:
  // восстановленная позиция в пикселях вернее сырых оценок, калибровка подводит под неё ряды, а не
  // наоборот; после — каждый замер выше окна держит содержимое под верхним краем на месте.
  const onMeasured = (entries) => {
    const el = scrollRef?.current;
    if (!el) return;
    const changed = [];
    let measuredSum = 0;
    let estimatedSum = 0;
    for (const entry of entries) {
      const id = s.elements.get(entry.target);
      if (id === undefined) continue;
      const height = entry.target.offsetHeight;
      if (!height) continue;
      if (!s.calibrated) {
        measuredSum += height;
        estimatedSum += s.estimate(id, s.box);
      }
      const was = s.applied.has(id) ? s.applied.get(id) : heightOf(id);
      s.heights.set(id, height);
      if (height !== was) changed.push([id, was]);
    }
    if (!changed.length && s.calibrated) return;
    if (changed.length) {
      const before = new Map(changed);
      if (s.calibrated) {
        shiftBy(
          el,
          scrollShift({
            ids: s.ids,
            before: (id) => (before.has(id) ? before.get(id) : heightOf(id)),
            after: heightOf,
            scrollTop: el.scrollTop,
          }),
        );
      }
      for (const [id] of changed) s.applied.set(id, s.heights.get(id));
      s.onMeasure?.();
    }
    if (!s.calibrated && estimatedSum > 0) {
      s.calibrated = true;
      // первая пачка может быть нетипичной (картинка, заголовки) — множитель в разумных пределах
      s.scale = Math.min(4, Math.max(0.5, measuredSum / estimatedSum));
      s.keepScroll = true;
      rerender();
    }
    compute();
  };

  const measureRef = useCallback((id) => {
    let ref = s.refs.get(id);
    if (!ref) {
      let current = null;
      ref = (el) => {
        if (current && s.observer) s.observer.unobserve(current);
        current = el;
        if (!el) {
          s.attached.delete(id);
          return;
        }
        s.attached.set(id, el);
        s.elements.set(el, id);
        if (s.observer) s.observer.observe(el);
      };
      s.refs.set(id, ref);
    }
    return ref;
  }, []);

  // Прокрутка к части id. Части нет в DOM — scrollTop к её оценённому смещению, затем по кадрам:
  // дождаться отрисовки и замера и довести верх части до верха окна. Часть уже в DOM — без
  // прокрутки: место внутри неё доводит вызывающий. Ответ — промис с элементом части или null
  // (части нет или она не отрисовалась). Прокрутка пишется как ручная.
  const scrollToPart = useCallback(
    (id) =>
      new Promise((resolve) => {
        const el = scrollRef?.current;
        if (!el) return resolve(null);
        if (!s.ids.includes(id)) return resolve(null);
        if (s.attached.has(id)) return resolve(s.attached.get(id));
        const topOf = () => {
          const index = s.ids.indexOf(id);
          return index < 0 ? null : layoutOffsets(s.ids, heightOf).tops[index];
        };
        const place = () => {
          const top = topOf();
          if (top === null) return false;
          el.scrollTop = top;
          compute();
          return true;
        };
        // Оценка верха ушла за экран от scrollTop (калибровка по первым замерам; scrollTop упёрся в
        // конец, пока разделители в DOM не выросли) — часть не попадёт в окно, ставить снова сразу.
        const missed = () => {
          const top = topOf();
          return top !== null && Math.abs(top - el.scrollTop) > el.clientHeight
            && el.scrollTop + el.clientHeight + 1 < el.scrollHeight;
        };
        if (!place()) return resolve(null);
        let frames = 0;
        let fixes = 0;
        const step = () => {
          frames += 1;
          const part = s.attached.get(id);
          if (!s.ids.includes(id)) return resolve(null);
          if (part && s.heights.has(id)) {
            const off = Math.round(topInScroller(el, part));
            if (!off || fixes >= SCROLL_FIXES) return resolve(part);
            fixes += 1;
            el.scrollTop += off;
            compute();
          } else if (!part && (frames % 10 === 0 || missed())) {
            place();
          }
          if (frames >= SCROLL_FRAMES) return resolve(part || null);
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    [],
  );

  // Список частей сменился: лишние замеры и ref-колбэки долой, окно пересчитать.
  useLayoutEffect(() => compute(), [layoutKey]);

  useLayoutEffect(() => {
    const known = new Set(ids);
    for (const map of [s.heights, s.estimates, s.applied, s.refs, s.attached]) {
      for (const id of map.keys()) if (!known.has(id)) map.delete(id);
    }
    compute();
  }, [ids]);

  // После каждого рендера: заглушки могли получить новые оценки (смена ширины) — содержимое под
  // верхним краем держится сдвигом scrollTop на разницу у частей выше окна; после калибровки
  // пиксели остаются, ряды подводятся под них.
  useLayoutEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;
    if (!s.keepScroll) {
      const before = (id) => (s.applied.has(id) ? s.applied.get(id) : heightOf(id));
      shiftBy(el, scrollShift({ ids: s.ids, before, after: heightOf, scrollTop: el.scrollTop }));
    }
    s.keepScroll = false;
    for (const id of s.ids) s.applied.set(id, heightOf(id));
  });

  useLayoutEffect(() => {
    const el = scrollRef?.current;
    if (!el) {
      compute();
      return undefined;
    }
    scrollers.set(el, { scrollToPart });
    setBox(readBox(el));
    if (s.start !== null && s.start !== undefined) {
      el.scrollTop = s.start;
      ownRef.current = Math.round(el.scrollTop);
      s.start = null;
    }
    // оценки переходят с коробки по умолчанию на настоящую — это не смена содержимого:
    // scrollTop (0 или восстановленная позиция в пикселях) остаётся без сдвига
    s.keepScroll = true;
    rerender();
    compute();

    const onScroll = () => {
      if (s.raf) return;
      s.raf = requestAnimationFrame(() => {
        s.raf = 0;
        compute();
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });

    let boxObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      // Части наблюдаются первым наблюдателем, коробка — вторым: в кадре смены ширины отрисованные
      // части уже перемерены, когда сбрасываются замеры остальных.
      s.observer = new ResizeObserver(onMeasured);
      for (const part of s.attached.values()) s.observer.observe(part);
      boxObserver = new ResizeObserver(() => {
        const box = readBox(el);
        const widthChanged = box.width !== s.box.width;
        setBox(box);
        if (widthChanged) {
          for (const id of s.heights.keys()) if (!s.attached.has(id)) s.heights.delete(id);
          rerender();
        }
        compute();
      });
      boxObserver.observe(el);
    }
    return () => {
      scrollers.delete(el);
      el.removeEventListener('scroll', onScroll);
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.observer?.disconnect();
      s.observer = null;
      boxObserver?.disconnect();
    };
  }, [scrollRef?.current]);

  return useMemo(
    () => ({ visible: s.visible, heightOf, measureRef, box: s.box, scrollToPart }),
    [s.visible, s.box, s.scale],
  );
};

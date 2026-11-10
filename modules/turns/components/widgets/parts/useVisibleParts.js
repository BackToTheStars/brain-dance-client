// Хук «окно прокрутки → id частей к отрисовке». Слушает scroll скроллера (пересчёт раз в кадр),
// меряет отрисованные части ResizeObserver'ом и помнит высоты по id, оценивает невидимые,
// калибрует оценку по первым замеренным частям и сдвигает scrollTop, когда части выше окна
// сменили высоту, — в том же кадре, до отрисовки (ResizeObserver и useLayoutEffect идут после
// вёрстки и до рисования). Смена ширины скроллера сбрасывает замеры: их делали при другой ширине.

import { useCallback, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { sameParts, scrollShift, visibleParts } from './layout';

// Коробка скроллера до первого замера: нужна только первому рендеру, его заменит
// useLayoutEffect до рисования.
const DEFAULT_BOX = { width: 600, viewport: 600, fontSize: 18, lineHeight: 24 };

const readBox = (el) => {
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
// measureRef(id) — ref-колбэк на корень отрисованной части; box — текущая коробка.
export const useVisibleParts = ({ scrollRef, ids, estimate, always, ownScrollRef }) => {
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
  s.ids = ids;
  if (s.estimate !== estimate) s.estimates.clear();
  s.estimate = estimate;
  s.always = always;

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

  // Без скроллера окна нет — рисуется всё.
  const compute = () => {
    const el = scrollRef?.current;
    const visible = el
      ? visibleParts({
          ids: s.ids,
          heightOf,
          scrollTop: el.scrollTop,
          viewportHeight: s.box.viewport,
          always: s.always,
        }).visible
      : new Set(s.ids);
    if (!sameParts(visible, s.visible)) {
      s.visible = visible;
      rerender();
    }
  };

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

  // Список частей сменился: лишние замеры и ref-колбэки долой, окно пересчитать.
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
    setBox(readBox(el));
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
      el.removeEventListener('scroll', onScroll);
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.observer?.disconnect();
      s.observer = null;
      boxObserver?.disconnect();
    };
  }, [scrollRef?.current]);

  return useMemo(
    () => ({ visible: s.visible, heightOf, measureRef, box: s.box }),
    [s.visible, s.box, s.scale],
  );
};

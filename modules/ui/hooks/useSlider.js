'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Ширина перетаскиваемой панели в границах [min, max] от wrapper'а; move(delta) —
// накопленный сдвиг от начала перетаскивания. options.clamp упирает шаг за границу в
// границу, иначе при быстрой мыши ширина не дотягивает до максимума.
export const useSlider = (
  leftSideWidth,
  setLeftSideWidth,
  wrapper,
  minWidthCallback = () => 0,
  maxWidthCallback = () => 0,
  { clamp = false } = {},
) => {
  const [minMaxWidth, setMinMaxWidth] = useState([null, null]);
  const [isDragging, setIsDragging] = useState(false);
  const [rendered, setRendered] = useState(false);

  const lastDraggingWidth = useMemo(() => {
    return leftSideWidth;
  }, [isDragging, rendered]);

  const move = useCallback(
    (delta) => {
      const [minWidth, maxWidth] = minMaxWidth;
      let next = leftSideWidth + delta;
      if (clamp) {
        next = Math.min(Math.max(next, minWidth), maxWidth);
      } else {
        if (next > maxWidth) return;
        if (next < minWidth) return;
      }
      if (lastDraggingWidth === next) return;
      setLeftSideWidth(next);
    },
    [lastDraggingWidth, minMaxWidth, clamp],
  );

  useEffect(() => {
    if (!wrapper) return;

    const applyBounds = () => {
      const max = maxWidthCallback(wrapper);
      setMinMaxWidth([minWidthCallback(wrapper), max]);
      // Сохранённая ширина может превышать вьюпорт — ужимаем, иначе панель шире
      // контейнера и ResizeObserver зацикливает пересчёт.
      setLeftSideWidth((prev) => (prev != null && prev > max ? max : prev));
    };

    applyBounds();

    const resizeObserver = new ResizeObserver(() => {
      if (!wrapper) return;
      applyBounds();
    });
    resizeObserver.observe(wrapper);

    return () => {
      resizeObserver.unobserve(wrapper);
    };
  }, [wrapper]);

  useEffect(() => {
    if (!wrapper) return;
    if (leftSideWidth) return;
    setLeftSideWidth(maxWidthCallback(wrapper));
  }, [wrapper, leftSideWidth]);

  useEffect(() => {
    setTimeout(() => setRendered(true), 100);
  }, []);

  return {
    move,
    setIsDragging,
  };
};

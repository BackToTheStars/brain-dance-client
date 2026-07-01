'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useSlider = (
  leftSideWidth,
  setLeftSideWidth,
  wrapper,
  minWidthCallbac = () => 0,
  maxWidthCallback = () => 0,
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
      if (leftSideWidth + delta > maxWidth) return;
      if (leftSideWidth + delta < minWidth) return;
      if (lastDraggingWidth === leftSideWidth + delta) return;
      setLeftSideWidth(leftSideWidth + delta);
    },
    [lastDraggingWidth, minMaxWidth],
  );

  useEffect(() => {
    if (!wrapper) return;

    const applyBounds = () => {
      const max = maxWidthCallback(wrapper);
      setMinMaxWidth([minWidthCallbac(wrapper), max]);
      // Сохранённая ширина может превышать текущий вьюпорт (напр. 1400px на экране
      // 1000px) — ужимаем до максимума. Иначе левая панель шире контейнера, и
      // ResizeObserver зацикливает пересчёт → лобби виснет.
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

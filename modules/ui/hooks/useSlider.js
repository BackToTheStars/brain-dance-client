'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Ширина перетаскиваемой панели в границах [min, max] от wrapper'а: move(delta)
// получает накопленный сдвиг от начала перетаскивания (VerticalSplit), сеттер
// зовётся и числом, и функцией от прежнего значения (как setState). Общий для
// панелей лобби, слайдера игры и панели редактора хода (modules/panels).
// options.clamp — шаг за границу упирает ширину в границу вместо того, чтобы
// пропасть: при быстром движении мыши накопленный сдвиг перескакивает край, и
// без ужатия ширина останавливалась на шаг раньше максимума. Включает панель
// редактора хода; лобби живёт по-старому (шаги за границу игнорируются).
export const useSlider = (
  leftSideWidth,
  setLeftSideWidth,
  wrapper,
  minWidthCallbac = () => 0,
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

import { useEffect, useRef } from 'react';

// Перетаскиваемый горизонтальный разделитель: сосед VerticalSplit для деления
// высоты. mousedown на ручке, move/up на document, move(delta) получает
// накопленный от начала перетаскивания сдвиг в пикселях. Размер и место задаёт
// потребитель через extraClasses.
export const HorizontalSplit = ({
  move = () => {},
  setIsDragging = () => {},
  extraClasses = '',
  testId,
}) => {
  const handleRef = useRef(null);
  // колбэки читаются из ref: слушатель навешивается один раз, а обёртка
  // пересоздаёт их при смене размеров карточки
  const callbacks = useRef(null);
  callbacks.current = { move, setIsDragging };

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    let startClientY = 0;

    const resizeMove = (e) => {
      callbacks.current.move(Math.round(e.clientY - startClientY));
    };
    const resizeUp = () => {
      document.removeEventListener('mousemove', resizeMove);
      document.removeEventListener('mouseup', resizeUp);
      callbacks.current.setIsDragging(false);
    };
    const resizeDown = (e) => {
      startClientY = e.clientY;
      callbacks.current.setIsDragging(true);
      document.addEventListener('mousemove', resizeMove);
      document.addEventListener('mouseup', resizeUp);
    };

    handle.addEventListener('mousedown', resizeDown);
    return () => {
      handle.removeEventListener('mousedown', resizeDown);
      document.removeEventListener('mousemove', resizeMove);
      document.removeEventListener('mouseup', resizeUp);
    };
  }, []);

  return (
    <div
      className={`horizontal-split ${extraClasses}`}
      ref={handleRef}
      data-test-id={testId}
    >
      <div className="horizontal-split__divider" />
    </div>
  );
};

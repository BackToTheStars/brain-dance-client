import { useEffect, useRef, useState } from 'react';

const MOVE_DELTA = 10;

export const VerticalSplit = ({
  move = () => {},
  setIsDragging = () => {},
  extraClasses = 'lobby-block',
}) => {
  const resizeLineRef = useRef(null);
  const [delta, setDelta] = useState(null);

  useEffect(() => {
    if (!resizeLineRef.current) return;
    let startClientX = 0;

    const resizeDown = (e) => {
      document.addEventListener('mouseup', resizeUp);
      document.addEventListener('mousemove', resizeMove);
      setIsDragging(true);
      startClientX = e.clientX;
    };
    const resizeUp = (e) => {
      document.removeEventListener('mouseup', resizeUp);
      document.removeEventListener('mousemove', resizeMove);
      setIsDragging(false);
    };
    const resizeMove = (e) => {
      const delta =
        Math.round((e.clientX - startClientX) / MOVE_DELTA) * MOVE_DELTA;
      setDelta(delta);
    };
    resizeLineRef.current.addEventListener('mousedown', resizeDown);

    return () => {
      if (resizeLineRef.current) {
        resizeLineRef.current.removeEventListener('mousedown', resizeDown);
      }
      document.removeEventListener('mousemove', resizeMove);
      document.removeEventListener('mouseup', resizeUp);
    };
  }, [resizeLineRef.current]);

  useEffect(() => {
    if (delta === null) return;
    move(delta);
  }, [delta]);

  return (
    <div
      className={`vertical-split ${extraClasses}`}
      ref={resizeLineRef}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div className="vertical-split__icon">⇄</div>
      <div className="vertical-split__divider" />
    </div>
  );
};

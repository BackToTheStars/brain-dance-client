import { useEffect, useRef, useState } from 'react';

const MOVE_DELTA = 10;
const SPLIT_WIDTH = 4 * 8 * 3; // @todo: разобраться с переменнымиКПрПП

export const VerticalSplit = ({
  move = () => {},
  extraClasses = 'lobby-block',
}) => {
  const resizeLineRef = useRef(null);
  const [delta, setDelta] = useState(null);

  useEffect(() => {
    if (!resizeLineRef.current) return;
    const { x } = resizeLineRef.current.getBoundingClientRect();
    const resizeDown = (e) => {
      document.addEventListener('mouseup', resizeUp);
      document.addEventListener('mousemove', resizeMove);
    };
    const resizeUp = (e) => {
      document.removeEventListener('mouseup', resizeUp);
      document.removeEventListener('mousemove', resizeMove);
    };
    const resizeMove = (e) => {
      const delta =
        Math.round((e.clientX - x - SPLIT_WIDTH / 2) / MOVE_DELTA) * MOVE_DELTA;
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
    <div className={`vertical-split ${extraClasses}`} ref={resizeLineRef}>
      <div className="vertical-split__icon">⇄</div>
      <div className="vertical-split__divider"/>
    </div>
  );
};

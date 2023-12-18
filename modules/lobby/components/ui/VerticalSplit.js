import { useEffect, useRef, useState } from 'react';

const MOVE_DELTA = 10;
const SPLIT_WIDTH = 30;

export const VerticalSplit = ({ move = () => {} }) => {
  const resizeLineRef = useRef(null);
  const [delta, setDelta] = useState(null);

  useEffect(() => {
    if (!resizeLineRef.current) return;
    const { x } = resizeLineRef.current.getBoundingClientRect();
    const resizeDown = (e) => {
      document.addEventListener('mouseup', resizeUp)
      document.addEventListener('mousemove', resizeMove)
    }
    const resizeUp = (e) => {
      document.removeEventListener('mouseup', resizeUp)
      document.removeEventListener('mousemove', resizeMove)
    }
    const resizeMove = (e) => {
      const delta = Math.round((e.clientX - x - SPLIT_WIDTH / 2) / MOVE_DELTA) * MOVE_DELTA;
      setDelta(delta);
    }
    resizeLineRef.current.addEventListener('mousedown', resizeDown)

    return () => {
      if (resizeLineRef.current) {
        resizeLineRef.current.removeEventListener('mousedown', resizeDown)
      }
      document.removeEventListener('mousemove', resizeMove)
      document.removeEventListener('mouseup', resizeUp)
    }
  }, [resizeLineRef.current])

  useEffect(() => {
    if (delta === null) return;
    move(delta);
  }, [delta])

  return (
    <div
      className={`absolute right-[-30px] top-[50%] translate-y-[-50%] xl:flex hidden justify-center items-center h-full select-none cursor-pointer`}
      ref={resizeLineRef}
    >
      <span
        className="flex justify-center items-center rounded-full border-2 dark:border-white border-dark-light dark:border-opacity-5 border-opacity-5 w-[25px] h-[25px] dark:bg-dark bg-white dark:text-white text-dark text-sm"
      >
        ⇄
      </span>
      <span className="absolute left-[50%] translate-x-[-50%] h-full w-[2px] dark:bg-white bg-dark-light dark:bg-opacity-5 bg-opacity-5 z-[-1]"></span>
    </div>
  );
};

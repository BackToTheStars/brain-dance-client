import { useEffect, useRef, useState } from 'react';

export const VerticalSplit = ({ resize, minW, maxW, element }) => {
  const resizeBtn = useRef(null);
  const [resizeWindow, setResizeWindow] = useState(0);

  const minWidth = minW || 30;
  const maxWidth = maxW || 51;

  const getResize = (positionMouse) => {
    const listenerMouseMove = (e) => {
      const percent = (e[positionMouse] / resizeWindow) * 100;
      if (percent < minWidth || percent > maxWidth) return;
      resize(percent);
    };

    resizeBtn.current.addEventListener('mousedown', () => {
      document.addEventListener('mousemove', listenerMouseMove);
    });

    const mouseUp = () => {
      document.removeEventListener('mousemove', listenerMouseMove);
    };

    document.addEventListener('mouseup', mouseUp);
  };

  useEffect(() => {
    if (
      !resizeBtn.current ||
      window === 'undefined' ||
      document === 'undefined'
    )
      return;

    if (element) {
      const el = document.querySelector(element);
      setResizeWindow(el.clientWidth);
      getResize('offsetX');
    } else {
      setResizeWindow(window.innerWidth);
      getResize('clientX');
    }
  }, [resizeBtn.current]);

  return (
    <div
      className={`absolute right-[-30px] top-[50%] translate-y-[-50%] xl:flex hidden justify-center items-center h-full select-none`}
    >
      <span
        className="flex justify-center items-center rounded-full border-2 dark:border-white border-dark-light dark:border-opacity-5 border-opacity-5 w-[25px] h-[25px] dark:bg-dark bg-white text-sm cursor-pointer"
        ref={resizeBtn}
      >
        ⇄
      </span>
      <span className="absolute left-[50%] translate-x-[-50%] h-full w-[2px] dark:bg-white bg-dark-light dark:bg-opacity-5 bg-opacity-5 z-[-1]"></span>
    </div>
  );
};

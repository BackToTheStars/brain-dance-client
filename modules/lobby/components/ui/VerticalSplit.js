import { useEffect, useRef, useState } from 'react';

const VerticalSplit = ({ resize }) => {
  const resizeBtn = useRef(null);
  const [resizeWindow, setResizeWindow] = useState(0);

  const minWidth = 30;
  const maxWidth = 51;

  useEffect(() => {
    if (!resizeBtn.current || !window || !document) return;
    setResizeWindow(window.innerWidth);

    const listenerMouseMove = (e) => {
      const percent = (e.clientX / resizeWindow) * 100;
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

export default VerticalSplit;

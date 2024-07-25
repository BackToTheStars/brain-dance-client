import { useMemo } from 'react';

const UIPanel = ({
  children,
  position,
  height,
  width,
  isMinimized,
  priorityStyle,
}) => {
  const calcStyles = useMemo(() => {
    let style = {};
    if (!!width) {
      if (+width == width) {
        style.width = `${width}px`;
      } else {
        style.width = width();
      }
    }
    if (!!height) {
      if (+height == height) {
        style.height = `${height}px`;
      }
    }
    if (priorityStyle) {
      style = { ...style, ...priorityStyle };
    }
    return style;
  }, [width, height, priorityStyle]);

  const classNames = useMemo(
    () => `${position} panel ${isMinimized ? 'minimized' : ''}`,
    [position, isMinimized],
  );

  return (
    <div className={classNames} style={calcStyles}>
      {children}
    </div>
  );
};

export default UIPanel;

import { panelSpacer } from '@/config/ui';
import { POSITION_UPPER_LEFT } from '../settings';

const UIPanel = ({
  children,
  position,
  height,
  width,
  isMinimized,
  priorityStyle,
}) => {
  //
  let style = {};

  if (!!width) {
    if (+width == width) {
      style.width = `${width}px`;
      // @learn приведение к числу и проверка
    } else {
      style.width = width();
    }
  }
  if (!!height) {
    style.height = height();
  }
  if (priorityStyle) {
    style = { ...style, ...priorityStyle };
  }

  return (
    <div
      className={`${position} po panel ${isMinimized ? 'minimized' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default UIPanel;

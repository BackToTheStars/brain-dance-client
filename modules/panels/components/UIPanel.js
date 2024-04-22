import { panelSpacer } from '@/config/ui';
import useSelection from 'antd/lib/table/hooks/useSelection';
import { useSelector } from 'react-redux';
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

  const d = useSelector((state) => state.panels.d);

  if (!!width) {
    if (+width == width) {
      style.width = `${width}px`;
      // @learn приведение к числу и проверка
    } else {
      style.width = width();
    }
  }
  if (!!height) {
    if (+height == height) {
      style.height = `${height}px`;
    } else {
      style.height = height(d);
    }
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

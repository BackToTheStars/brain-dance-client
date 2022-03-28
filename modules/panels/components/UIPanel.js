import { panelSpacer } from '@/config/ui';
import { POSITION_UPPER_LEFT } from '../settings';

const UIPanel = ({ children, position, height, width }) => {
  //
  const style = {};

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

  return (
    <div className={`${position} po panel`} style={style}>
      {children}
    </div>
  );
};

export default UIPanel;

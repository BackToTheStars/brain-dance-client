import { panelSpacer } from '@/config/ui';
import { POSITION_UPPER_LEFT } from '../settings';

const UIPanel = ({ children, position, height, width }) => {
  //
  const style = {};

  if (!!width) {
    style.width = width();
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

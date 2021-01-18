import { useContext } from 'react';
import { UI_Context } from '../contexts/UI_Context';

const ClassesPanel = () => {
  const {
    state: { classesPanelIsHidden },
  } = useContext(UI_Context);
  return (
    <div
      className={['p0', classesPanelIsHidden ? 'hidden' : ''].join(' ')}
      id="classMenu"
    />
  );
};

export default ClassesPanel;

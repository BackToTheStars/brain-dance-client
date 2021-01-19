import { useUiContext } from '../contexts/UI_Context';

const ClassesPanel = () => {
  const {
    state: { classesPanelIsHidden },
  } = useUiContext();
  return (
    <div
      className={['p0', classesPanelIsHidden ? 'hidden' : ''].join(' ')}
      id="classMenu"
    />
  );
};

export default ClassesPanel;

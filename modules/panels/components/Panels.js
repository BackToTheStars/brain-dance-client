import { useSelector } from 'react-redux';
import UIPanel from './UIPanel';
import SettingsButton from './SettingsButton';

const Panels = () => {
  const hash = useSelector((state) => state.game?.game?.hash);
  const panels = useSelector((state) => state.panels.panels);
  if (!hash) return null;
  return (
    <>
      {panels
        .filter((panel) => panel.isDisplayed)
        .map((panel) => (
          <UIPanel
            key={panel.id}
            position={panel.position}
            height={panel?.height}
            width={panel?.width}
          >
            <panel.component settings={panel} />
          </UIPanel>
        ))}
      <SettingsButton />
    </>
  );
};

export default Panels;

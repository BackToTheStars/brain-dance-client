import { useSelector } from 'react-redux';
import UIPanel from './UIPanel';
import SettingsButton from './SettingsButton';
import { POSITION_POPUP } from '../settings';
import PanelPopup from './Popup';

const Panels = () => {
  const hash = useSelector((state) => state.game?.game?.hash);
  const panels = useSelector((state) => state.panels.panels);
  if (!hash) return null;
  return (
    <>
      {panels
        .filter((panel) => panel.isDisplayed)
        .map((panel) => {
          const Wrapper = UIPanel
          if (panel.position === POSITION_POPUP) {
            Wrapper = PanelPopup
          }
          return (
            <Wrapper
              key={panel.id}
              position={panel.position}
              height={panel?.height}
              width={panel?.width}
            >
              <panel.component settings={panel} />
            </Wrapper>
          )
        })}
      <SettingsButton />
    </>
  );
};

export default Panels;

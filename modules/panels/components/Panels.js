import { useSelector } from 'react-redux';
import UIPanel from './UIPanel';
import SettingsButton from './SettingsButton';
import { PANEL_ADD_EDIT_TURN, POSITION_POPUP } from '../settings';
import PanelPopup from './Popup';
import { useEffect } from 'react';
import { setInitialPanels } from '../redux/storage';

const Panels = () => {
  const hash = useSelector((state) => state.game?.game?.hash);
  // const panels = useSelector((state) => state.panels.panels);
  const panelsDict = useSelector((state) => state.panels.d);
  const panels = Object.values(panelsDict);

  useEffect(() => {
    setInitialPanels(panelsDict);
  }, [panelsDict]);

  if (!hash) return null;
  return (
    <>
      {panels
        .filter((panel) => {
          return panel.isDisplayed;
        })
        .map((panel) => {
          let Wrapper = UIPanel;
          if (panel.position === POSITION_POPUP) {
            Wrapper = PanelPopup;
          }
          return (
            <Wrapper
              key={panel.id}
              position={panel.position}
              height={panel?.height}
              width={panel?.width}
              isMinimized={panel.isMinimized}
              priorityStyle={panel?.priorityStyle}
            >
              <panel.component settings={panel} />
            </Wrapper>
          );
        })}
      <SettingsButton />
    </>
  );
};

export default Panels;

'use client';
import { useSelector } from 'react-redux';
import UIPanel from './UIPanel';
import SettingsButton from './SettingsButton';
import { PANEL_ADD_EDIT_TURN, POSITION_POPUP } from '../settings';
import PanelPopup from './Popup';
import { useEffect, useMemo, memo } from 'react';
import { setInitialPanels } from '../redux/storage';

const shortListIds = [
  // 'panel_buttons',
  'panel_minimap',
  // 'panel_notifications',
  // 'PANEL_SNAP_TO_GRID',
  // 'panel_add_edit_turn',
  // 'panel_info',
  'panel_lines',
  // 'panel_turn_info',
  // 'panel_turns_paste',
];

const PanelAdapter = memo(({ id }) => {
  const panel = useSelector((state) => state.panels.d[id]);
  const Wrapper = panel.position === POSITION_POPUP ? PanelPopup : UIPanel;
  return (
    <Wrapper
      key={panel.id}
      position={panel.position}
      height={panel?.height}
      width={panel?.width}
      isMinimized={panel.isMinimized}
      priorityStyle={panel?.priorityStyle}
    >
      <panel.component settings={panel} id={id} />
    </Wrapper>
  );
});

const Panels = ({ shortList = false }) => {
  const hash = useSelector((state) => state.game?.game?.hash);
  const panelsDict = useSelector((state) => state.panels.d);
  const panels = Object.values(panelsDict);

  const panelIdsToDisplay = useMemo(() => {
    return panels
      .filter((panel) => {
        if (shortList && !shortListIds.includes(panel.type)) {
          return false;
        }
        return panel.isDisplayed;
      })
      .map((panel) => {
        return panel.type;
      });
  }, [panels, shortList]);

  // useEffect(() => {
  //   setInitialPanels(panels);
  // }, [panels]);

  if (!hash) return null;

  return (
    <>
      {panelIdsToDisplay.map((panelId) => {
        return <PanelAdapter key={panelId} id={panelId} />;
      })}
      <SettingsButton />
    </>
  );
};

export default Panels;

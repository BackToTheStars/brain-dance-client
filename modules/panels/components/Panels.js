'use client';
import { useSelector } from 'react-redux';
import UIPanel from './UIPanel';
import SettingsButton from './SettingsButton';
import { useMemo, memo } from 'react';
// import { setInitialPanels } from '../redux/storage';

const shortListIds = [
  // 'panel_buttons',
  'panel_minimap',
  // 'panel_notifications',
  // 'panel_add_edit_turn',
  // 'panel_info',
  'panel_lines',
  // 'panel_turn_info',
  // 'panel_turns_paste',
];

const PanelAdapter = memo(({ id }) => {
  const panel = useSelector((state) => state.panels.d[id]);
  return (
    <UIPanel
      key={panel.id}
      position={panel.position}
      height={panel?.height}
      width={panel?.width}
      isMinimized={panel.isMinimized}
      priorityStyle={panel?.priorityStyle}
    >
      <panel.component id={id} />
    </UIPanel>
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

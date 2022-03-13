import dynamic from 'next/dynamic';

import { panelSpacer } from '@/config/ui';
import ClassList from '../classes/components/ClassList';
// import AddEditTurnPopup from '@/modules/turns/components/addEditTurn';
const AddEditTurnPopup = dynamic(() => import('@/modules/turns/components/forms/AddEditTurn'), {
  ssr: false,
});
import SettingsPanel from './components/SettingsPanel';

export const POSITION_UPPER_LEFT = 'position_upper_left';
export const POSITION_UPPER_CENTER = 'position_upper_center';
export const POSITION_POPUP = 'position_popup';

export const PANEL_CLASSES = 'panel_classes';
export const PANEL_SETTINGS = 'panel_settings';
export const PANEL_ADD_EDIT_TURN = 'panel_add_edit_turn';

export const panels = [
  {
    type: PANEL_CLASSES,
    position: POSITION_UPPER_LEFT,
    component: ClassList,
    isDisplayed: false,
    id: 1,
    height: () => {
      console.log(window.innerHeight, panelSpacer);
      return `${window.innerHeight - 2 * panelSpacer}px`;
    },
    width: () => '500px',
  },
  {
    type: PANEL_SETTINGS,
    position: POSITION_UPPER_CENTER,
    component: SettingsPanel,
    isDisplayed: false,
    id: 2,
    width: () => '800px',
  },
  {
    type: PANEL_ADD_EDIT_TURN,
    position: POSITION_POPUP,
    component: AddEditTurnPopup,
    isDisplayed: false,
    id: 3,
    width: () => '1000px',
  },
];

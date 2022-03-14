import dynamic from 'next/dynamic';

import { panelSpacer } from '@/config/ui';
import ClassList from '../classes/components/ClassList';
// import AddEditTurnPopup from '@/modules/turns/components/addEditTurn';
const AddEditTurnPopup = dynamic(
  () => import('@/modules/turns/components/forms/AddEditTurn'),
  {
    ssr: false,
  }
);
import SettingsPanel from './components/SettingsPanel';
import ButtonsPanel from './components/ButtonsPanel';

export const POSITION_UPPER_LEFT = 'position_upper_left';
export const POSITION_UPPER_CENTER = 'position_upper_center';
export const POSITION_POPUP = 'position_popup';
export const POSITION_BOTTOM_RIGHT = 'position_bottom_right';

export const PANEL_CLASSES = 'panel_classes';
export const PANEL_SETTINGS = 'panel_settings';
export const PANEL_ADD_EDIT_TURN = 'panel_add_edit_turn';
export const PANEL_BUTTONS = 'panel_buttons';

const can = () => true;
const RULE_TURNS_CRUD = 1;

const defaultButtons = [
  {
    text: 'Add Turn',
    callback: () => {
      // turnDispatch({ type: ACTION_RESET_TURN_EDIT_MODE });
      // setCreateEditTurnPopupIsHidden(false);
    },
    show: () => can(RULE_TURNS_CRUD),
  },
  {
    text: 'Save Field',
    callback: () => {
      // saveField()
    },
    show: () => can(RULE_TURNS_CRUD),
  },
  {
    text: 'Classes',
    callback: () => {
      // dispatch({ type: 'CLASS_PANEL_SET', payload: !classesPanelIsHidden })
    },
  },
  {
    text: 'Info',
    callback: () => {
      // setGameInfoPanelIsHidden((prevVal) => !prevVal)
    },
  },
  {
    text: 'Minimap',
    callback: () => {
      // minimapDispatch({ type: 'MINIMAP_SHOW_HIDE' }
    },
  },
  {
    text: 'Lobby',
    callback: () => {
      // router.push('/')
    },
  },
  {
    text: 'Paste Turn',
    callback: () => {
      // insertTurnFromBuffer(null, {
      //   successCallback: () => {
      //     console.log('success inserted turn from buffer');
      //   },
      //   errorCallback: (message) => {
      //     console.log(message);
      //   },
      // });
      // setPanelType(PANEL_PASTE);
    },
    show: () => true, //can(RULE_TURNS_CRUD) && isTurnInBuffer,
  },
  null,
  null,
];

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
  {
    type: PANEL_BUTTONS,
    position: POSITION_BOTTOM_RIGHT,
    component: ButtonsPanel,
    isDisplayed: true,
    id: 4,
    width: () => '350px',
    buttons: defaultButtons,
  },
];

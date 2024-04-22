'use client';
import dynamic from 'next/dynamic';

import { panelSpacer } from '@/config/ui';
import ClassList from '../classes/components/ClassList';

// import AddEditTurnPopup from '@/modules/turns/components/forms/TurnBlocks';

const AddEditTurnPopup = dynamic(
  () => import('@/modules/turns/components/forms/AddEditTurn'),
  {
    ssr: false,
  }
);

import SettingsPanel from './components/SettingsPanel';
import ButtonsPanel from './components/ButtonsPanel';
import InfoPanel from './components/InfoPanel';
import Minimap from '../minimap/components/Minimap';
import Notifications from '../ui/components/Notifications';
import LinesPanel from './components/LinesPanel';
import TurnInfo from '../turns/components/TurnInfo';
import PasteTurnPanel from './components/PasteTurnPanel';

export const POSITION_UPPER_LEFT = 'position_upper_left';
export const POSITION_UPPER_CENTER = 'position_upper_center';
export const POSITION_POPUP = 'position_popup';
export const POSITION_UPPER_RIGHT = 'position_upper_right';
export const POSITION_BOTTOM_RIGHT = 'position_bottom_right';
export const POSITION_BOTTOM_LEFT = 'position_bottom_left';
export const POSITION_BOTTOM_CENTER = 'position_bottom_center';
export const POSITION_NOTIFICATIONS = 'position_notifications';
export const POSITION_FLEXIBLE = 'position_flexible';
export const POSITION_INVISIBLE = 'POSITION_INVISIBLE';

export const PANEL_CLASSES = 'panel_classes';
export const PANEL_SETTINGS = 'panel_settings';
export const PANEL_ADD_EDIT_TURN = 'panel_add_edit_turn';
export const PANEL_BUTTONS = 'panel_buttons';
export const PANEL_INFO = 'panel_info';
export const PANEL_MINIMAP = 'panel_minimap';
export const PANEL_NOTIFICATIONS = 'panel_notifications';
export const PANEL_LINES = 'panel_lines';
export const PANEL_TURN_INFO = 'panel_turn_info';
export const PANEL_TURNS_PASTE = 'panel_turns_paste';
export const PANEL_SNAP_TO_GRID = 'PANEL_SNAP_TO_GRID';

export const MODE_GAME = 'game';
export const MODE_WIDGET_PICTURE = 'widget-picture';
export const MODE_WIDGET_PARAGRAPH = 'widget-paragraph';

export const MODE_WIDGET_PICTURE_QUOTE_ADD = 'widget-picture-quote-add';
export const MODE_BUTTON_PICTURE_ADD_AREA = 'widget-picture-add-area';

export const MODE_WIDGET_PICTURE_QUOTE_ACTIVE = 'widget-picture-quote-active';
export const MODE_BUTTON_PICTURE_MODIFY_AREA = 'widget-picture-modify-area';
export const MODE_OPERATION_PASTE = 'operation-paste';

export const PANEL_MINIMAP_STYLES = 'panel-minimap-styles';
export const PANEL_BUTTONS_STYLES = 'actions';

let id = 0;

export const panels = [
  {
    type: PANEL_CLASSES,
    position: POSITION_UPPER_LEFT,
    component: ClassList,
    isDisplayed: false,
    id: (id += 1),
    height: (d) => {
      const minimapHeight = d[PANEL_MINIMAP].isDisplayed
        ? +d[PANEL_MINIMAP].calculatedHeight +
          panelSpacer +
          (d[PANEL_MINIMAP].isMinimized ? 40 : 33)
        : 0;
      console.log(window.innerHeight, panelSpacer);
      return `${window.innerHeight - 2 * panelSpacer - minimapHeight}px`;
    },
    width: () => '500px',
  },
  {
    type: PANEL_SETTINGS,
    position: POSITION_UPPER_CENTER,
    component: SettingsPanel,
    isDisplayed: false,
    id: (id += 1),
    width: () => '800px',
  },
  {
    type: PANEL_ADD_EDIT_TURN,
    position: POSITION_UPPER_RIGHT,
    component: AddEditTurnPopup,
    isDisplayed: false,
    id: (id += 1),
    width: () => '1000px',
  },
  {
    type: PANEL_BUTTONS,
    position: [POSITION_BOTTOM_RIGHT, PANEL_BUTTONS_STYLES].join(' '),
    component: ButtonsPanel,
    isDisplayed: true,
    id: (id += 1),
    width: () => '310px',
  },
  {
    type: PANEL_INFO,
    position: POSITION_UPPER_CENTER,
    component: InfoPanel,
    isDisplayed: false,
    id: (id += 1),
    width: () => '630px',
  },
  {
    type: PANEL_MINIMAP,
    position: [POSITION_BOTTOM_LEFT, PANEL_MINIMAP_STYLES].join(' '),
    component: Minimap,
    isDisplayed: true,
    id: (id += 1),
    width: 400, // () => '600px',
    isMinimized: false, // сворачивание в маленькую кнопку
    size: 100,
    fieldsToSave: ['position', 'isDisplayed', 'isMinimized', 'size'],
  },
  {
    type: PANEL_LINES,
    position: POSITION_BOTTOM_CENTER,
    component: LinesPanel,
    isDisplayed: true,
    id: (id += 1),
    width: () => `50vw`,
  },
  {
    type: PANEL_NOTIFICATIONS,
    position: POSITION_NOTIFICATIONS,
    component: Notifications,
    isDisplayed: true,
    id: (id += 1),
    // width: () => `calc(min(25vw, 360px))`,
  },
  {
    type: PANEL_TURN_INFO,
    position: POSITION_FLEXIBLE,
    component: TurnInfo,
    isDisplayed: false,
    id: (id += 1),
    width: () => `640px`,
  },
  {
    type: PANEL_TURNS_PASTE,
    position: POSITION_BOTTOM_CENTER,
    component: PasteTurnPanel,
    isDisplayed: false,
    id: (id += 1),
    width: () => `50vw`,
  },

  {
    type: PANEL_SNAP_TO_GRID,
    position: POSITION_INVISIBLE,
    component: () => {
      return null;
    },
    isDisplayed: true, // пока решили оставить так, потом переключить на isSwitchOn или подобное
    id: (id += 1),
    width: () => `50vw`,
  },
];

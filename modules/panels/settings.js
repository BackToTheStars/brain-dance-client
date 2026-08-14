'use client';
import dynamic from 'next/dynamic';

import { panelSpacer } from '@/config/ui';
import ClassList from '../classes/components/ClassList';
// Константы панелей переехали в config/panel.js: этот модуль собирает массив `panels`
// из компонентов, и импорт констант обратно сюда замыкал цикл (в прод-сборке — TDZ).
// Реэкспорт оставлен для совместимости, но новым импортёрам брать из '@/config/panel'.
import {
  PANEL_ADD_EDIT_TURN,
  PANEL_BUTTONS,
  PANEL_BUTTONS_STYLES,
  PANEL_CLASSES,
  PANEL_INFO,
  PANEL_LINES,
  PANEL_MINIMAP,
  PANEL_MINIMAP_STYLES,
  PANEL_NOTIFICATIONS,
  PANEL_SETTINGS,
  PANEL_TURN_INFO,
  PANEL_TURNS_PASTE,
  POSITION_BOTTOM_CENTER,
  POSITION_BOTTOM_LEFT,
  POSITION_BOTTOM_RIGHT,
  POSITION_FLEXIBLE,
  POSITION_NOTIFICATIONS,
  POSITION_UPPER_CENTER,
  POSITION_UPPER_LEFT,
  POSITION_UPPER_RIGHT,
} from '@/config/panel';

export * from '@/config/panel';

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

export const panels = [
  {
    type: PANEL_CLASSES,
    position: POSITION_UPPER_LEFT,
    component: ClassList,
    isDisplayed: false,
    height: (d) => {
      const minimapHeight = d[PANEL_MINIMAP].isDisplayed
        ? +d[PANEL_MINIMAP].calculatedHeight +
          panelSpacer +
          (d[PANEL_MINIMAP].isMinimized ? 40 : 33)
        : 0;
      return `${window.innerHeight - 2 * panelSpacer - minimapHeight}px`;
    },
    width: () => '500px',
  },
  {
    type: PANEL_SETTINGS,
    position: POSITION_UPPER_CENTER,
    component: SettingsPanel,
    isDisplayed: false,
    width: () => '800px',
  },
  {
    type: PANEL_ADD_EDIT_TURN,
    position: POSITION_UPPER_RIGHT,
    component: AddEditTurnPopup,
    isDisplayed: false,
    width: () => '900px',
  },
  {
    type: PANEL_BUTTONS,
    position: [POSITION_BOTTOM_RIGHT, PANEL_BUTTONS_STYLES].join(' '),
    component: ButtonsPanel,
    isDisplayed: true,
    width: () => '310px',
  },
  {
    type: PANEL_INFO,
    position: POSITION_UPPER_CENTER,
    component: InfoPanel,
    isDisplayed: false,
    width: () => '630px',
  },
  {
    type: PANEL_MINIMAP,
    position: [POSITION_BOTTOM_LEFT, PANEL_MINIMAP_STYLES].join(' '),
    component: Minimap,
    isDisplayed: true,
    width: 400, // () => '600px',
    isMinimized: false, // сворачивание в маленькую кнопку
    size: 100,
    fieldsToSave: ['isDisplayed', 'isMinimized', 'size'],
  },
  {
    type: PANEL_LINES,
    position: POSITION_BOTTOM_CENTER,
    component: LinesPanel,
    isDisplayed: false,
    width: () => `50vw`,
  },
  {
    type: PANEL_NOTIFICATIONS,
    position: POSITION_NOTIFICATIONS,
    component: Notifications,
    isDisplayed: true,
    // width: () => `calc(min(25vw, 360px))`,
  },
  {
    type: PANEL_TURN_INFO,
    position: POSITION_FLEXIBLE,
    component: TurnInfo,
    isDisplayed: false,
    width: () => `640px`,
  },
  {
    type: PANEL_TURNS_PASTE,
    position: POSITION_BOTTOM_CENTER,
    component: PasteTurnPanel,
    isDisplayed: false,
    width: () => `50vw`,
  },
];

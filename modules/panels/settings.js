import { panelSpacer } from '@/config/ui';
import ClassList from '../classes/components/ClassList';

export const POSITION_UPPER_LEFT = 'position_upper_left';

export const PANEL_CLASSES = 'panel_classes';

export const panels = [
  {
    type: PANEL_CLASSES,
    position: POSITION_UPPER_LEFT,
    component: ClassList,
    isDisplayed: true,
    id: 1,
    height: () => {
      console.log(window.innerHeight, panelSpacer);
      return `${window.innerHeight - 2 * panelSpacer}px`;
    },
    width: () => '500px',
  },
];

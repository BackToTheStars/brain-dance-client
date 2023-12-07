import {
  SLIDER_MODAL_GAME,
  SLIDER_MODAL_TURN,
} from '@/config/lobby/sliderModal';
import GameModal from './GameModal';
import TurnModal from './TurnModal';

export const settingsSliderModal = {
  [SLIDER_MODAL_GAME]: {
    component: GameModal,
  },
  [SLIDER_MODAL_TURN]: {
    component: TurnModal,
  },
};

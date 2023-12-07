import {
  MODAL_CREATE_GAME,
  MODAL_DONATE,
  MODAL_ENTER_GAME,
  SLIDER_MODAL_GAME,
} from '@/config/lobby/modal';
import CreateGame from './CreateGame';
import EnterGame from './EnterGame';
import DonateModal from './DonateModal';
import GameModal from '../sliderModals/GameModal';

export const settings = {
  [MODAL_CREATE_GAME]: {
    title: 'Создать игру',
    component: CreateGame,
  },
  [MODAL_ENTER_GAME]: {
    title: 'Войти в игру',
    component: EnterGame,
  },
  [MODAL_DONATE]: {
    title: 'Вклад в развитие проекта',
    component: DonateModal,
  },
};

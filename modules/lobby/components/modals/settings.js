import { MODAL_CREATE_GAME, MODAL_ENTER_GAME } from '@/config/lobby/modal';
import CreateGame from './CreateGame';
import EnterGame from './EnterGame';

export const settings = {
  [MODAL_CREATE_GAME]: {
    title: 'Создать игру',
    component: CreateGame,
  },
  [MODAL_ENTER_GAME]: {
    title: 'Войти в игру',
    component: EnterGame,
  },
};

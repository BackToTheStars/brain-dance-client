import {
  MODAL_CONFIRM,
  MODAL_CREATE_GAME,
  MODAL_DONATE,
  MODAL_ENTER_GAME,
  SLIDER_MODAL_GAME,
} from '@/config/lobby/modal';
import EnterGameModal from '@/modules/lobby/components/modals/EnterGame';
import CreateGameModal from '@/modules/lobby/components/modals/CreateGame';
import DonateModal from '@/modules/lobby/components/modals/Donate';
import ConfirmModal from '@/modules/lobby/components/modals/ConfirmModal';

export const settings = {
  [MODAL_ENTER_GAME]: {
    title: 'Войти в игру',
    component: EnterGameModal,
  },
  [MODAL_CREATE_GAME]: {
    title: 'Создать игру',
    component: CreateGameModal,
  },
  [MODAL_DONATE]: {
    title: 'Вклад в развитие проекта',
    component: DonateModal,
  },
  [MODAL_CONFIRM]: {
    title: 'Подтверждение',
    component: ConfirmModal,
  },
};

import {
  MODAL_ACCESS_GAMES,
  MODAL_CONFIRM,
  MODAL_CREATE_GAME,
  MODAL_DONATE,
  MODAL_ENTER_GAME,
  MODAL_UPLOAD,
} from '@/config/lobby/modal';
import EnterGameModal from '@/modules/lobby/components/modals/EnterGame';
import CreateGameModal from '@/modules/lobby/components/modals/CreateGame';
import DonateModal from '@/modules/lobby/components/modals/Donate';
import ConfirmModal from '@/modules/lobby/components/modals/ConfirmModal';
import UploadModal from '@/modules/lobby/components/modals/UploadModal';
import AccessGames from '@/modules/lobby/components/modals/AccessGames';

export const settings = {
  [MODAL_ENTER_GAME]: {
    title: 'Enter Game', // 'Войти в игру',
    component: EnterGameModal,
  },
  [MODAL_CREATE_GAME]: {
    title: 'Create Game', // 'Создать игру',
    component: CreateGameModal,
  },
  [MODAL_DONATE]: {
    title: 'Donate', // 'Вклад в развитие проекта',
    component: DonateModal,
  },
  [MODAL_CONFIRM]: {
    title: 'Confirm', // 'Подтверждение',
    component: ConfirmModal,
  },
  [MODAL_UPLOAD]: {
    title: 'Upload', // 'Загрузка',
    component: UploadModal,
  },
  [MODAL_ACCESS_GAMES]: {
    title: 'Manage Access', // 'Закладки',
    component: AccessGames,
  },
};

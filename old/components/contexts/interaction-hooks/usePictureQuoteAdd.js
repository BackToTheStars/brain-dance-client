import { useUserContext } from '../UserContext';
import { RULE_TURNS_CRUD } from '../../config';
import {
  MODE_WIDGET_PICTURE,
  MODE_GAME,
  MODE_BUTTON_PICTURE_ADD_AREA,
} from '../InteractionContext';

export const usePictureQuoteAdd = ({
  setInteractionMode,
  setInteractionType,
  performActions,
}) => {
  const { can } = useUserContext();

  return [
    {
      text: 'Save Area',
      callback: () => {
        performActions({
          info: MODE_BUTTON_PICTURE_ADD_AREA,
          func: () => {
            setInteractionMode(MODE_GAME); // переходим в общий режим игры для панели кнопок
            setInteractionType(null); // говорим, что никакой виджет теперь не активен
          },
        });
        // savePictureCrop();
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    {
      text: 'Cancel',
      callback: () => {
        setInteractionMode(MODE_WIDGET_PICTURE); // набор кнопок справа
        setInteractionType(null); // что мы делаем с виджетом
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];
};

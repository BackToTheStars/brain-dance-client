import { INTERACTION_ADD_QUOTE } from '../../turn/settings';
import { useUserContext } from '../UserContext';
import { RULE_TURNS_CRUD } from '../../config';
import { MODE_WIDGET_PICTURE, MODE_GAME } from '../InteractionContext';

export const usePictureQuoteAdd = ({
  setInteractionMode,
  interactWithWidget,
  performActions,
}) => {
  const { can } = useUserContext();

  return [
    {
      text: 'Save Area',
      callback: () => {
        performActions({
          info: 'Save Area request to server',
          func: () => {
            setInteractionMode(MODE_GAME); // переходим в общий режим игры для панели кнопок
            interactWithWidget(null); // говорим, что никакой виджет теперь не активен
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
        interactWithWidget(null); // что мы делаем с виджетом
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];
};

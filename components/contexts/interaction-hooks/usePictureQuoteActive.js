import { INTERACTION_ADD_QUOTE } from '../../turn/settings';
import { useUserContext } from '../UserContext';
import { RULE_TURNS_CRUD } from '../../config';
import { MODE_GAME } from '../InteractionContext';
import { ACTION_QUOTE_CANCEL } from '../TurnContext';

export const usePictureQuoteActive = ({
  setInteractionMode,
  interactWithWidget,
  performActions,
  dispatch,
}) => {
  const { can } = useUserContext();

  return [
    {
      text: 'Modify',
      callback: () => {
        // performActions({
        //   info: 'Save Area request to server',
        //   func: () => {
        //     setInteractionMode(MODE_GAME); // переходим в общий режим игры для панели кнопок
        //     interactWithWidget(null); // говорим, что никакой виджет теперь не активен
        //   },
        // });
        // savePictureCrop();
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Delete',
      callback: () => {
        // performActions({
        //   info: 'Save Area request to server',
        //   func: () => {
        //     setInteractionMode(MODE_GAME); // переходим в общий режим игры для панели кнопок
        //     interactWithWidget(null); // говорим, что никакой виджет теперь не активен
        //   },
        // });
        // // savePictureCrop();
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    null,
    null,
    null,
    null,
    null,
    null,
    {
      text: 'Cancel',
      callback: () => {
        setInteractionMode(MODE_GAME); // набор кнопок справа
        interactWithWidget(null); // что мы делаем с виджетом
        dispatch({ type: ACTION_QUOTE_CANCEL });
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];
};

import { INTERACTION_ADD_QUOTE } from '../../turn/settings';
import { useUserContext } from '../UserContext';
import { useTurnContext } from '../TurnContext';

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
  const { activeQuote, deleteQuote } = useTurnContext();

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
        if (!activeQuote) return;
        const { quoteId, turnId } = activeQuote;

        deleteQuote(
          { turnId, quoteId },
          {
            successCallback: () => {
              dispatch({
                type: ACTION_PICTURE_QUOTE_DELETE,
                payload: { quoteId, turnId },
              });
              // tempMiddlewareFn({ type: ACTION_DELETE_TURN, payload: { quoteId } });
            },
          }
        );
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

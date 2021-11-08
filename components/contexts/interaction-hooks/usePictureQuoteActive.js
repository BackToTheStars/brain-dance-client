import { useUserContext } from '../UserContext';
import { useTurnContext } from '../TurnContext';

import { RULE_TURNS_CRUD } from '../../config';
import {
  MODE_GAME,
  MODE_BUTTON_PICTURE_MODIFY_AREA,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
  INTERACTION_ADD_QUOTE,
} from '../InteractionContext';
import {
  ACTION_QUOTE_CANCEL,
  ACTION_PICTURE_QUOTE_DELETE,
  ACTION_LINES_DELETE,
} from '../TurnContext';

export const usePictureQuoteActive = ({
  setInteractionMode,
  setInteractionType,
  performActions,
  dispatch,
}) => {
  const { can } = useUserContext();
  const { activeQuote, deleteQuote, lineEnds, lines, deleteLines } =
    useTurnContext();

  return [
    {
      text: 'Modify',
      callback: () => {
        performActions({
          info: MODE_BUTTON_PICTURE_MODIFY_AREA,
          func: () => {
            setInteractionType(INTERACTION_ADD_QUOTE);
            setInteractionMode(MODE_WIDGET_PICTURE_QUOTE_ADD);
          },
        });
        savePictureCrop();
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Delete',
      callback: () => {
        if (!activeQuote) return;
        const { quoteId, turnId } = activeQuote;

        const quoteKey = `${turnId}_${quoteId}`;

        const deleteFunc = () =>
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

        if (!!lineEnds[quoteKey]) {
          if (confirm('Confirm: Delete picture fragment with red lines?')) {
            const linesToDelete = lines
              .filter(
                (line) =>
                  (line.sourceTurnId === turnId &&
                    line.sourceMarker === quoteId) ||
                  (line.targetTurnId === turnId &&
                    line.targetMarker === quoteId)
              )
              .map((line) => line._id);
            if (!!linesToDelete.length) {
              deleteLines(linesToDelete, {
                successCallback: () => {
                  dispatch({
                    type: ACTION_LINES_DELETE,
                    payload: linesToDelete,
                  });
                  deleteFunc();
                },
              });
            }
          }
          return;
        }

        if (!confirm('Confirm: Delete picture fragment?')) return;
        deleteFunc();
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
        setInteractionType(null); // что мы делаем с виджетом
        dispatch({ type: ACTION_QUOTE_CANCEL });
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];
};

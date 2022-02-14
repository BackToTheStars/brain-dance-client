import { useUserContext } from '../UserContext';
import { useTurnsCollectionContext } from '../TurnsCollectionContext';

import { RULE_TURNS_CRUD } from '../../config';
import {
  MODE_GAME,
  MODE_BUTTON_PICTURE_MODIFY_AREA,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
  INTERACTION_ADD_OR_EDIT_QUOTE,
  WIDGET_PICTURE,
} from '../InteractionContext';
import {
  ACTION_QUOTE_CANCEL,
  ACTION_PICTURE_QUOTE_DELETE,
  ACTION_LINES_DELETE,
} from '../TurnsCollectionContext';

export const usePictureQuoteActive = ({
  setInteractionMode,
  setInteractionType,
  performActions,
  dispatch,
  makeWidgetActive,
}) => {
  const { can } = useUserContext();
  const { activeQuote, deleteQuote, lineEnds, lines, deleteLines } =
    useTurnsCollectionContext();

  return [
    {
      text: 'Modify',
      callback: () => {
        if (!activeQuote) return;
        const { quoteId, turnId } = activeQuote;
        // const quoteKey = `${turnId}_${quoteId}`;
        makeWidgetActive(turnId, WIDGET_PICTURE, 'picture1'); // (turnId, widgetType, widgetId)
        // делаем синюю рамку у картинки
        setInteractionType(INTERACTION_ADD_OR_EDIT_QUOTE);
        setInteractionMode(MODE_WIDGET_PICTURE_QUOTE_ADD);
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

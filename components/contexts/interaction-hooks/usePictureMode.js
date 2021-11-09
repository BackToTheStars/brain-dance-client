import { useUserContext } from '../UserContext';
import { RULE_TURNS_CRUD } from '../../config';
import {
  MODE_GAME,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
  INTERACTION_ADD_OR_EDIT_QUOTE,
} from '../InteractionContext';

export const usePictureMode = ({
  setInteractionType,
  setInteractionMode,
  makeWidgetActive,
}) => {
  const { can } = useUserContext();

  return [
    {
      text: 'Add Area',
      callback: () => {
        setInteractionType(INTERACTION_ADD_OR_EDIT_QUOTE);
        setInteractionMode(MODE_WIDGET_PICTURE_QUOTE_ADD);
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
        setInteractionMode(MODE_GAME);
        makeWidgetActive(null);
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];
};

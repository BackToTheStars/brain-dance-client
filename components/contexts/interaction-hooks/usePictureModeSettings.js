import { INTERACTION_ADD_QUOTE } from '../../turn/settings';
import { useUserContext } from '../UserContext';
import { RULE_TURNS_CRUD } from '../../config';
import { MODE_GAME } from '../InteractionContext';

export const usePictureModeSettings = ({
  interactWithWidget,
  setInteractionMode,
  makeWidgetActive,
}) => {
  const { can } = useUserContext();

  return [
    {
      text: 'Add Area',
      callback: () => {
        interactWithWidget(INTERACTION_ADD_QUOTE);
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

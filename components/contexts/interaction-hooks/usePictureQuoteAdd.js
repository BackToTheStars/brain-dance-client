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
        performActions(() => {
          // setInteractionMode(MODE_GAME);
          // interactWithWidget(null); // что мы делаем с виджетом,
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

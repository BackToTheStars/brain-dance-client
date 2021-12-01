import { useUserContext } from '../../UserContext';
// import { RULE_TURNS_CRUD } from '../../../config';
import { MODE_GAME } from '../../InteractionContext';

export const useParagraphMode = ({
  // setInteractionType,
  setInteractionMode,
  makeWidgetActive,
  // dispatch,
}) => {
  const { can } = useUserContext();

  return [
    {
      text: 'Compress',
      callback: () => {},
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
    },
  ];
};

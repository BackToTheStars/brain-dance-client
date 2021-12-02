import { useUserContext } from '../../UserContext';
// import { RULE_TURNS_CRUD } from '../../../config';
import {
  MODE_GAME,
  INTERACTION_COMPRESS_PARAGRAPH,
} from '../../InteractionContext';

export const useParagraphMode = ({
  setInteractionType,
  setInteractionMode,
  makeWidgetActive,
  // dispatch,
}) => {
  const { can } = useUserContext();

  return [
    {
      text: 'Compress',
      callback: () => {
        console.log({ INTERACTION_COMPRESS_PARAGRAPH });
        setInteractionType(INTERACTION_COMPRESS_PARAGRAPH);
        // setInteractionMode(MODE_GAME);
        // makeWidgetActive(null);
      },
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

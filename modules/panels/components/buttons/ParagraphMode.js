import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../redux/actions';
import { MODE_GAME } from '../../settings';
import { Buttons } from '../ButtonsPanel';

const ParagraphMode = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Compress',
      callback: () => {
        // console.log({ INTERACTION_COMPRESS_PARAGRAPH });
        // setInteractionType(INTERACTION_COMPRESS_PARAGRAPH);
        // setInteractionMode(MODE_GAME);
        // makeWidgetActive(null);
      },
    },
    {
      text: 'Uncompress',
      callback: () => {
        // console.log({ INTERACTION_UNCOMPRESS_PARAGRAPH });
        // setInteractionType(INTERACTION_UNCOMPRESS_PARAGRAPH);
      },
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
        dispatch(resetAndExit());
        // makeWidgetActive(null);
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default ParagraphMode;

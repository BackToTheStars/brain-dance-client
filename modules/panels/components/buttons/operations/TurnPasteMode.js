import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { setPanelMode, togglePanel } from '../../../redux/actions';
import { MODE_GAME, PANEL_TURNS_PASTE } from '../../../settings';
import { Buttons } from '../../ButtonsPanel';

const TurnPasteMode = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
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
        dispatch(setPanelMode({ mode: MODE_GAME }));
        dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: false }));
      },
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default TurnPasteMode;

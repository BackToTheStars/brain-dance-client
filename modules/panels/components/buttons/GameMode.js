import { RULE_TURNS_CRUD } from '@/config/user';
import { saveField } from '@/modules/game/game-redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setPanelMode, togglePanel } from '../../redux/actions';
import {
  MODE_OPERATION_PASTE,
  PANEL_ADD_EDIT_TURN,
  PANEL_CLASSES,
  PANEL_INFO,
  PANEL_MINIMAP,
  PANEL_TURNS_PASTE,
} from '../../settings';
import { Buttons } from '../ButtonsPanel';

const GameMode = () => {
  //
  const router = useRouter();
  const { can } = useUserContext();
  const isTurnInBuffer = useSelector(
    (state) => !!state.turns.turnsToPaste.length
  );

  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Add Turn',
      callback: () => {
        dispatch(
          togglePanel({
            type: PANEL_ADD_EDIT_TURN,
            open: true,
            params: { editTurnId: null },
          })
        );
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Save Field',
      callback: () => dispatch(saveField()),
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Classes',
      callback: () => {
        dispatch(togglePanel({ type: PANEL_CLASSES }));
      },
    },
    {
      text: 'Info',
      callback: () => {
        dispatch(togglePanel({ type: PANEL_INFO }));
      },
    },
    {
      text: 'Minimap',
      callback: () => {
        dispatch(togglePanel({ type: PANEL_MINIMAP }));
      },
    },
    { text: 'Lobby', callback: () => router.push('/') },
    {
      text: 'Paste\u00A0Turn',
      callback: () => {
        dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: true }));
        dispatch(setPanelMode({ mode: MODE_OPERATION_PASTE }));
      },
      show: () => can(RULE_TURNS_CRUD) && isTurnInBuffer,
    },
    null,
    null,
  ];

  return <Buttons buttons={buttons} />;
};

export default GameMode;

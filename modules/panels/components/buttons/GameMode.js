import { RULE_TURNS_CRUD } from '@/config/user';
import { saveField } from '@/modules/game/game-redux/actions';
import { castSaved } from '@/modules/presence/redux/actions';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setPanelMode, togglePanel } from '../../redux/actions';
import {
  PANEL_ADD_EDIT_TURN,
  PANEL_CLASSES,
  PANEL_INFO,
  PANEL_MINIMAP,
  PANEL_TURNS_PASTE,
} from '@/config/panel';
import { Buttons } from './Buttons';
import { MODE_OPERATION_PASTE } from '@/config/panel';
import { TID } from '@/config/testIds';

const GameMode = () => {
  //
  const router = useRouter();
  const { can } = useUserContext();
  const isTurnInBuffer = useSelector(
    (state) => !!state.turns.turnsToPaste.length
  );
  // A follower of a tour only watches: no adding, saving or pasting until they
  // leave the tour (the buttons come back by themselves).
  const following = useSelector(selectFollowing);

  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Add Turn',
      testId: TID.gameAction('add-turn'),
      callback: () => {
        dispatch(
          togglePanel({
            type: PANEL_ADD_EDIT_TURN,
            open: true,
            params: { editTurnId: null },
          })
        );
      },
      show: () => can(RULE_TURNS_CRUD) && !following,
    },
    {
      text: 'Save Field',
      testId: TID.gameAction('save-field'),
      // The guide of a tour tells the followers that the field is saved — one
      // frame, once both requests of the save are through (castSaved is a
      // no-op for everyone else).
      callback: () =>
        dispatch(saveField({ onSaved: () => dispatch(castSaved()) })),
      show: () => can(RULE_TURNS_CRUD) && !following,
    },
    {
      text: 'Classes',
      testId: TID.gameAction('classes'),
      callback: () => {
        dispatch(togglePanel({ type: PANEL_CLASSES }));
      },
    },
    {
      text: 'Info',
      testId: TID.gameAction('info'),
      callback: () => {
        dispatch(togglePanel({ type: PANEL_INFO }));
      },
    },
    {
      text: 'Minimap',
      testId: TID.gameAction('minimap'),
      callback: () => {
        dispatch(togglePanel({ type: PANEL_MINIMAP }));
      },
    },
    {
      text: 'Lobby',
      testId: TID.gameAction('lobby'),
      callback: () => router.push('/'),
    },
    {
      text: 'Paste\u00A0Turn',
      testId: TID.gameAction('paste-turn'),
      callback: () => {
        dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: true }));
        dispatch(setPanelMode({ mode: MODE_OPERATION_PASTE }));
      },
      show: () => can(RULE_TURNS_CRUD) && isTurnInBuffer && !following,
    },
    null,
    null,
  ];

  return <Buttons buttons={buttons} />;
};

export default GameMode;

import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { togglePanel } from '../../redux/actions';
import { PANEL_ADD_EDIT_TURN, PANEL_CLASSES, PANEL_INFO } from '../../settings';
import { Buttons } from '../ButtonsPanel';

const GameMode = () => {
  //
  const router = useRouter();
  const { can } = useUserContext();
  const isTurnInBuffer = false;

  const dispatch = useDispatch();

  // const {
  //   setGameInfoPanelIsHidden,
  //   state: { classesPanelIsHidden },
  //   dispatch,
  //   minimapDispatch,
  //   setCreateEditTurnPopupIsHidden,
  // } = useUiContext();
  // const {
  //   saveField,
  //   dispatch: turnDispatch,
  //   insertTurnFromBuffer,
  // } = useTurnsCollectionContext();

  const buttons = [
    {
      text: 'Add Turn',
      callback: () => {
        dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Save Field',
      // callback: () => saveField(),
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
        // minimapDispatch({ type: 'MINIMAP_SHOW_HIDE' })
      },
    },
    { text: 'Lobby', callback: () => router.push('/') },
    {
      text: 'Paste Turn',
      callback: () => {
        // insertTurnFromBuffer(null, {
        //   successCallback: () => {
        //     console.log('success inserted turn from buffer');
        //   },
        //   errorCallback: (message) => {
        //     console.log(message);
        //   },
        // });
        // setPanelType(PANEL_PASTE);
      },
      show: () => can(RULE_TURNS_CRUD) && isTurnInBuffer,
    },
    null,
    null,
  ];

  return <Buttons buttons={buttons} />;
};

export default GameMode;

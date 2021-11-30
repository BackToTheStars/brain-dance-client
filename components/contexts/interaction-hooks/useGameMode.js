import { useRouter } from 'next/router';
import { useUiContext } from '../UI_Context'; // export const useUiContext
import { useUserContext } from '../UserContext';
import { useTurnContext, ACTION_RESET_TURN_EDIT_MODE } from '../TurnContext';
import { RULE_TURNS_CRUD } from '../../config';
import { PANEL_PASTE } from '../InteractionContext';

export const useGameMode = ({ setPanelType }) => {
  const router = useRouter();
  const { info, can, isTurnInBuffer } = useUserContext();

  const {
    setGameInfoPanelIsHidden,
    state: { classesPanelIsHidden },
    dispatch,
    minimapDispatch,
    setCreateEditTurnPopupIsHidden,
  } = useUiContext();
  const {
    saveField,
    dispatch: turnDispatch,
    insertTurnFromBuffer,
  } = useTurnContext();

  return [
    {
      text: 'Add Turn',
      callback: () => {
        turnDispatch({ type: ACTION_RESET_TURN_EDIT_MODE });
        setCreateEditTurnPopupIsHidden(false);
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Save Field',
      callback: () => saveField(),
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Classes',
      callback: () =>
        dispatch({ type: 'CLASS_PANEL_SET', payload: !classesPanelIsHidden }),
    },
    {
      text: 'Info',
      callback: () => setGameInfoPanelIsHidden((prevVal) => !prevVal),
    },
    {
      text: 'Minimap',
      callback: () => minimapDispatch({ type: 'MINIMAP_SHOW_HIDE' }),
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
        setPanelType(PANEL_PASTE);
      },
      show: () => can(RULE_TURNS_CRUD) && isTurnInBuffer,
    },
    null,
    null,
  ];
};

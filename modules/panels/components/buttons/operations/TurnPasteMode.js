import { createCancelCallback } from '@/modules/game/game-redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  resetAndExit,
  setPanelMode,
  togglePanel,
} from '../../../redux/actions';
import { MODE_GAME, PANEL_TURNS_PASTE } from '../../../settings';
import { Buttons } from '../../ButtonsPanel';

const TurnPasteMode = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const cancelCallback = () => {
    dispatch(resetAndExit());
    dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: false }));
  };

  useEffect(() => {
    dispatch(createCancelCallback(cancelCallback));
  }, []);

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
      callback: cancelCallback,
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default TurnPasteMode;

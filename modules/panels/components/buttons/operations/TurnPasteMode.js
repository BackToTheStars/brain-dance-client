import { createCancelCallback } from '@/modules/game/game-redux/actions';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  resetAndExit,
  togglePanel,
} from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';
import { PANEL_TURNS_PASTE } from '@/modules/panels/settings';

const TurnPasteMode = () => {
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

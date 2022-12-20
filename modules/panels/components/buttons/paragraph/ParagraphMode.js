import { RULE_TURNS_CRUD } from '@/config/user';
import {
  compressParagraph,
  unCompressParagraph,
} from '@/modules/turns/redux/actions';
import { setCallsQueueIsBlocked } from '@/modules/ui/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit } from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';

const ParagraphMode = () => {
  //
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const activeTurn = useSelector((state) => state.turns.d[editTurnId]);

  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    !activeTurn?.compressed
      ? {
          text: 'Compress',
          callback: () => {
            // dispatch(setCallsQueueIsBlocked(true));
            dispatch(compressParagraph());
          },
        }
      : {
          text: 'Uncompress',
          callback: () => {
            // dispatch(setCallsQueueIsBlocked(true));
            dispatch(unCompressParagraph());
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
        dispatch(resetAndExit());
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default ParagraphMode;

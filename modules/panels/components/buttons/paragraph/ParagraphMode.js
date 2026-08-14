import { RULE_TURNS_CRUD } from '@/config/user';
import {
  compressParagraph,
  unCompressParagraph,
} from '@/modules/turns/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit } from '../../../redux/actions';
import { Buttons } from '../Buttons';

const ParagraphMode = () => {
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const paragraphWidget = useSelector(
    (state) => state.turns.d[editTurnId]?.dWidgets?.p_1,
  );

  const canBeCompressed = paragraphWidget?.quotes?.length > 1;
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    canBeCompressed && !paragraphWidget?.compressed
      ? {
          text: 'Compress',
          callback: () => {
            dispatch(compressParagraph());
          },
        }
      : paragraphWidget?.compressed
        ? {
            text: 'Uncompress',
            callback: () => {
              dispatch(unCompressParagraph());
            },
          }
        : null,
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

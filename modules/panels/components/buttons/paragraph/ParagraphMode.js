import { RULE_TURNS_CRUD } from '@/config/user';
import { compressParagraph } from '@/modules/turns/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { MODE_WIDGET_PARAGRAPH_COMPRESS } from '../../../settings';
import { Buttons } from '../../ButtonsPanel';

const ParagraphMode = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Compress',
      callback: () => {
        dispatch(compressParagraph());
        // dispatch(setPanelMode({ mode: MODE_WIDGET_PARAGRAPH_COMPRESS }));
        // dispatch(markTurnAsChanged({ _id: turnId }));
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

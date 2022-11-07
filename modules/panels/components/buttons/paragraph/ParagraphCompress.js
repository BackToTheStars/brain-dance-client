import { RULE_TURNS_CRUD } from '@/config/user';
import { savePictureQuoteByCrop } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { resetAndExit } from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';

const ParagraphCompress = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Save Area',
      callback: () => {
        dispatch(savePictureQuoteByCrop()).then(() => {
          dispatch(resetAndExit());
        });
      },
      show: () => can(RULE_TURNS_CRUD),
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
        // dispatch(setPanelMode({ mode: MODE_WIDGET_PICTURE }));
        dispatch(resetAndExit());
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default ParagraphCompress;

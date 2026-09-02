import { RULE_TURNS_CRUD } from '@/config/user';
import { savePictureQuoteByCrop } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { MODE_WIDGET_PICTURE } from '@/config/panel';
import { Buttons } from '../Buttons';
import { TID } from '@/config/testIds';

const PictureQuoteAdd = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Save Area',
      testId: TID.panelAction('save-area'),
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
      testId: TID.panelAction('cancel'),
      callback: () => {
        // dispatch(setPanelMode({ mode: MODE_WIDGET_PICTURE }));
        dispatch(resetAndExit());
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default PictureQuoteAdd;

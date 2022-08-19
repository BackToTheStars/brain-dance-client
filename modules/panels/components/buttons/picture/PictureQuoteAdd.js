import { RULE_TURNS_CRUD } from '@/config/user';
import { savePictureQuoteByCrop } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { setPanelMode } from '../../../redux/actions';
import {
  MODE_GAME,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '../../../settings';
import { Buttons } from '../../ButtonsPanel';

const PictureQuoteAdd = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Save Area',
      callback: () => {
        dispatch(savePictureQuoteByCrop()).then(() => {
          dispatch(setPanelMode({ mode: MODE_WIDGET_PICTURE }));
        });
        // performActions({
        //   info: MODE_BUTTON_PICTURE_SAVE_AREA,
        //   func: () => {
        //     setInteractionMode(MODE_GAME); // переходим в общий режим игры для панели кнопок
        //     setInteractionType(null); // говорим, что никакой виджет теперь не активен
        //   },
        // });
        // savePictureCrop();
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
        dispatch(setPanelMode({ mode: MODE_WIDGET_PICTURE }));
        // makeWidgetActive(null);
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default PictureQuoteAdd;

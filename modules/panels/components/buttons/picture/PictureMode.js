import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';
import { MODE_WIDGET_PICTURE_QUOTE_ADD } from '@/config/panel';

const PictureMode = () => {
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Add Area',
      callback: () => {
        dispatch(setPanelMode({ mode: MODE_WIDGET_PICTURE_QUOTE_ADD }));
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
        dispatch(resetAndExit());
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default PictureMode;

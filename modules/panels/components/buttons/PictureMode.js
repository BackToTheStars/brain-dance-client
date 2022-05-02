import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { setPanelMode } from '../../redux/actions';
import { MODE_GAME, MODE_WIDGET_PICTURE_QUOTE_ADD } from '../../settings';
import { Buttons } from '../ButtonsPanel';

const PictureMode = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Add Area',
      callback: () => {
        // dispatch({ type: ACTION_QUOTE_CANCEL });
        // setInteractionType(INTERACTION_ADD_OR_EDIT_QUOTE);
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
        dispatch(setPanelMode({ mode: MODE_GAME }));
        // makeWidgetActive(null);
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default PictureMode;

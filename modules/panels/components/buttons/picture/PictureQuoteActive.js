import { RULE_TURNS_CRUD } from '@/config/user';
import { deleteQuote } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';
import { MODE_WIDGET_PICTURE_QUOTE_ADD } from '@/config/panel';

const PictureQuoteActive = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Modify',
      callback: () => {
        dispatch(setPanelMode({ mode: MODE_WIDGET_PICTURE_QUOTE_ADD }));
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Delete',
      callback: () => {
        dispatch(deleteQuote()).then(() => {
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

export default PictureQuoteActive;

import { RULE_TURNS_CRUD } from '@/config/user';
import { deleteQuote } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { setPanelMode } from '../../../redux/actions';
import {
  MODE_GAME,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '../../../settings';
import { Buttons } from '../../ButtonsPanel';

const PictureQuoteActive = () => {
  //
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const buttons = [
    {
      text: 'Modify',
      callback: () => {
        dispatch(
          setPanelMode({ mode: MODE_WIDGET_PICTURE_QUOTE_ADD, params: {} })
        );
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Delete',
      callback: () => {
        dispatch(deleteQuote()).then(() => {
          dispatch(setPanelMode({ mode: MODE_WIDGET_PICTURE }));
        });

        // const linesToDelete = filterLinesByQuoteKeys(
        //   lines,
        //   quotesDeleted.map((quote) => `${turnToEdit._id}_${quote.id}`)
        // );

        // if (!!quotesDeleted.length) {
        //   dispatch(linesDelete(linesToDelete.map((l) => l._id)));
        // }

        // dispatch(resaveTurn(turnObj, zeroPoint, saveCallbacks));
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
        dispatch(setPanelMode({ mode: MODE_GAME }));
        // makeWidgetActive(null);
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default PictureQuoteActive;

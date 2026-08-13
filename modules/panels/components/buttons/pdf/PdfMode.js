import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';
import { MODE_WIDGET_PDF_QUOTE_ADD } from '@/config/panel';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';

// Аналог PictureMode: цитата добавляется к активной странице документа —
// её номер уже лежит в editWidgetParams (виджет пишет его при прокрутке).
const PdfMode = () => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const activePage = useSelector(
    (state) => getWidgetDataFromState(state).editWidgetParams?.activePage,
  );

  const buttons = [
    {
      text: `Add Area${activePage ? ` (p. ${activePage})` : ''}`,
      callback: () => {
        dispatch(setPanelMode({ mode: MODE_WIDGET_PDF_QUOTE_ADD }));
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

export default PdfMode;

import { RULE_TURNS_CRUD } from '@/config/user';
import { savePdfQuoteByCrop } from '@/modules/quotes/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit } from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';

const PdfQuoteAdd = () => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  // без выделения сохранять нечего (у картинки это приводило к падению на crop)
  const hasCrop = useSelector((state) => {
    const { crop } = getWidgetDataFromState(state).editWidgetParams || {};
    return !!crop?.width && !!crop?.height;
  });

  const buttons = [
    {
      text: 'Save Area',
      callback: () => {
        if (!hasCrop) return;
        dispatch(savePdfQuoteByCrop()).then(() => {
          dispatch(resetAndExit());
        });
      },
      show: () => can(RULE_TURNS_CRUD) && hasCrop,
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

export default PdfQuoteAdd;

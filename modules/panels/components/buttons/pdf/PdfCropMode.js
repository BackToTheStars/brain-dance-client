import { RULE_TURNS_CRUD } from '@/config/user';
import { TID } from '@/config/testIds';
import { EMPTY_CROP } from '@/modules/turns/components/widgets/pdf/cropGeometry';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';
import { savePdfCrop } from '@/modules/turns/redux/actions';
import { castSaved } from '@/modules/presence/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { changeWidgetParams, resetAndExit } from '../../../redux/actions';
import { Buttons } from '../Buttons';

const PdfCropMode = () => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const widgetKey = useSelector(
    (state) => `${state.panels.editTurnId}_${state.panels.editWidgetId}`,
  );
  const activePage = useSelector(
    (state) => getWidgetDataFromState(state).editWidgetParams?.activePage,
  );

  const buttons = [
    {
      text: 'Save Crop',
      testId: TID.panelAction('save-crop'),
      // Спутники экскурсии перечитывают ход по тому же кадру `saved`, что и
      // Save Field (castSaved — no-op, когда я не веду).
      callback: () => {
        dispatch(savePdfCrop({ onSaved: () => dispatch(castSaved()) })).then(
          () => {
            dispatch(resetAndExit());
          },
        );
      },
      show: () => can(RULE_TURNS_CRUD),
    },
    {
      text: 'Full Page',
      testId: TID.panelAction('full-page'),
      callback: () => {
        dispatch(
          changeWidgetParams({
            widgetKey,
            params: { activePage, pdfCrop: { ...EMPTY_CROP } },
          }),
        );
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
      testId: TID.panelAction('cancel'),
      callback: () => {
        dispatch(resetAndExit());
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default PdfCropMode;

// Режим виджета статьи md и перевода: Compress (у сжатого — Uncompress) с двумя и более цитатами,
// как у абзаца; Edit — форма хода, как раньше открывал карандаш; Cancel. После записи флага — кадр
// saved спутникам.

import { TID } from '@/config/testIds';
import { RULE_TURNS_CRUD } from '@/config/user';
import { requestMediaQuotesClose } from '@/modules/panels/redux/mediaQuotesPanel';
import { castSaved } from '@/modules/presence/redux/actions';
import { useOpenTurnForm } from '@/modules/turns/components/helpers/useOpenTurnForm';
import { rowsQuoteIndex } from '@/modules/turns/components/widgets/translation/quotes';
import { setTurnCompressed } from '@/modules/turns/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit } from '../../../redux/actions';
import { Buttons } from '../Buttons';

const RowsMode = () => {
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const editWidgetId = useSelector((state) => state.panels.editWidgetId);
  const widget = useSelector(
    (state) => state.turns.d[editTurnId]?.dWidgets?.[editWidgetId],
  );
  const openForm = useOpenTurnForm(editTurnId);
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const busy = useRef(false);

  const canBeCompressed = rowsQuoteIndex(widget?.rows).count > 1;
  const write = (compressed) => {
    if (busy.current) return;
    busy.current = true;
    dispatch(setTurnCompressed(editTurnId, compressed)).then((saved) => {
      busy.current = false;
      if (saved) dispatch(castSaved());
    });
  };
  const allowed = () => can(RULE_TURNS_CRUD);

  const buttons = [
    widget?.compressed
      ? {
          text: 'Uncompress',
          testId: TID.panelAction('uncompress'),
          callback: () => write(false),
          show: allowed,
        }
      : canBeCompressed
        ? {
            text: 'Compress',
            testId: TID.panelAction('compress'),
            callback: () => write(true),
            show: allowed,
          }
        : null,
    {
      text: 'Edit',
      testId: TID.panelAction('edit-widget'),
      callback: () => {
        dispatch(resetAndExit());
        dispatch(requestMediaQuotesClose(openForm));
      },
      show: allowed,
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
      show: allowed,
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default RowsMode;

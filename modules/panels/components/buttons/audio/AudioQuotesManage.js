import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { Buttons } from '../../ButtonsPanel';
import { deleteAudioQuotesWidget } from '@/modules/turns/redux/actions'; //
// import { MODE_WIDGET_AUDIO_QUOTES_MANAGE } from '@/config/panel';

const AudioQuotesManage = () => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const { editTurnId, editWidgetId } = useSelector((state) => state.panels);
  const turn = useSelector((state) => state.turns.d[editTurnId]);
  const widget = turn.dWidgets[editWidgetId];
  // @todo: проверить widget.type === 'audio-quotes'
  const buttons = [
    null,
    {
      text: 'Delete',
      callback: () => {
        dispatch(deleteAudioQuotesWidget(editTurnId, editWidgetId)).then(() => {
          dispatch(resetAndExit());
        })
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

export default AudioQuotesManage;

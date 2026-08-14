import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { Buttons } from '../Buttons';
import { MODE_WIDGET_AUDIO_QUOTES_MANAGE } from '@/config/panel';
import { addAudioQuotesWidget } from '@/modules/turns/redux/actions'; //

const AudioMode = () => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const { editTurnId, editWidgetId, duration } = useSelector(
    (state) => state.panels,
  );

  // проверить, есть ли уже виджет audio-quotes
  const audioQuotesWidget = useSelector(
    (state) => state.turns.d[editTurnId].dWidgets['aq_1'],
  );
  const buttons = [
    {
      text: 'Quotes On',
      callback: () => {
        dispatch(addAudioQuotesWidget(editTurnId, editWidgetId, duration)).then(
          () => {
            // переключиться на виджет audio-quotes
            dispatch(
              setPanelMode({
                mode: MODE_WIDGET_AUDIO_QUOTES_MANAGE,
                editTurnId: editTurnId,
                editWidgetId: 'aq_1',
              }),
            );
          },
        );
      },
      show: () => can(RULE_TURNS_CRUD) && !audioQuotesWidget.duration,
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

export default AudioMode;

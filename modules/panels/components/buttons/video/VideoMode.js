import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetAndExit, setPanelMode } from '../../../redux/actions';
import { Buttons } from '../Buttons';
import { TID } from '@/config/testIds';
import { MODE_WIDGET_VIDEO_QUOTES_MANAGE } from '@/config/panel';
import { addVideoQuotesWidget } from '@/modules/turns/redux/actions';

const VideoMode = () => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const { editTurnId, editWidgetId, duration } = useSelector(
    (state) => state.panels,
  );

  // проверить, есть ли уже виджет video-quotes
  const videoQuotesWidget = useSelector(
    (state) => state.turns.d[editTurnId].dWidgets['vq_1'],
  );
  const buttons = [
    {
      text: 'Quotes On',
      testId: TID.panelAction('quotes-on'),
      callback: () => {
        dispatch(addVideoQuotesWidget(editTurnId, editWidgetId, duration)).then(
          () => {
            // переключиться на виджет video-quotes
            dispatch(
              setPanelMode({
                mode: MODE_WIDGET_VIDEO_QUOTES_MANAGE,
                editTurnId: editTurnId,
                editWidgetId: 'vq_1',
              }),
            );
          },
        );
      },
      show: () => can(RULE_TURNS_CRUD) && !videoQuotesWidget.duration,
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
      testId: TID.panelAction('cancel'),
      callback: () => {
        dispatch(resetAndExit());
      },
      show: () => can(RULE_TURNS_CRUD),
    },
  ];

  return <Buttons buttons={buttons} />;
};

export default VideoMode;

// Карандаш статьи md и перевода: панель действий переходит в режим виджета (Compress / Uncompress,
// Edit — форма хода, Cancel), как у абзаца.

import { MODE_WIDGET_ROWS } from '@/config/panel';
import { TID } from '@/config/testIds';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { useDispatch, useSelector } from 'react-redux';

const MdEditButton = ({ turnId, widgetId }) => {
  const dispatch = useDispatch();
  const following = useSelector(selectFollowing);
  if (following) return null;
  return (
    <a
      className="widget-button"
      href="#"
      data-test-id={TID.widgetEdit}
      data-turn-id={turnId}
      data-widget-id={widgetId}
      onClick={(e) => {
        e.preventDefault();
        dispatch(
          setPanelMode({
            mode: MODE_WIDGET_ROWS,
            params: { editTurnId: turnId, editWidgetId: widgetId },
          }),
        );
      }}
    >
      <i className="fas fa-pen"></i>
    </a>
  );
};

export default MdEditButton;

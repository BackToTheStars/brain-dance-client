// Карандаш md-статьи: у исходника нет режима разметки на карточке, правка — в форме хода.

import { TID } from '@/config/testIds';
import { requestMediaQuotesClose } from '@/modules/panels/redux/mediaQuotesPanel';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { useOpenTurnForm } from '../../helpers/useOpenTurnForm';

const MdEditButton = ({ turnId, widgetId }) => {
  const dispatch = useDispatch();
  const openForm = useOpenTurnForm(turnId);
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
        dispatch(requestMediaQuotesClose(openForm));
      }}
    >
      <i className="fas fa-pen"></i>
    </a>
  );
};

export default MdEditButton;

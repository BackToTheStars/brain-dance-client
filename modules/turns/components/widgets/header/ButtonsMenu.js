import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { RULE_TURNS_CRUD } from '@/config/user';
import {
  bringTurnToFront,
  cloneTurn,
  deleteTurn,
  sendTurnToBack,
} from '../../../redux/actions';
import {
  BringToFrontIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  LinkIcon,
  ScissorIcon,
  SendToBackIcon,
} from '../../icons/Turn';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '@/modules/ui/redux/actions';
import { useOpenTurnForm } from '../../helpers/useOpenTurnForm';
import { TID } from '@/config/testIds';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { castSaved } from '@/modules/presence/redux/actions';
import { requestMediaQuotesClose } from '@/modules/panels/redux/mediaQuotesPanel';

const ButtonsMenu = ({ _id }) => {
  const t = useTranslations('Game.turnActions');
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const gameHash = useSelector((state) => state.game.game?.hash);
  const openForm = useOpenTurnForm(_id);
  const following = useSelector(selectFollowing);
  const canEdit = can(RULE_TURNS_CRUD) && !following;
  const onDeleted = () => dispatch(castSaved());

  const handleCut = (e) => {
    e.preventDefault();
    if (confirm(t('confirmCut'))) {
      dispatch(cloneTurn(_id)).then(() => {
        dispatch(deleteTurn(_id, { onDeleted }));
      });
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (confirm(t('confirmDelete'))) {
      dispatch(deleteTurn(_id, { onDeleted }));
    }
  };

  // Открытая панель цитат закрывается как по ✕: с вопросом, если правки не записаны.
  const handleEdit = (e) => {
    e.preventDefault();
    dispatch(requestMediaQuotesClose(openForm));
  };

  const handleFront = (e) => {
    e.preventDefault();
    dispatch(bringTurnToFront(_id));
  };

  const handleBack = (e) => {
    e.preventDefault();
    dispatch(sendTurnToBack(_id));
  };

  const handleClone = (e) => {
    e.preventDefault();
    dispatch(cloneTurn(_id));
  };

  const handleShare = (e) => {
    e.preventDefault();
    const url = `${window.location.origin}/game/view/${gameHash}?turn=${_id}`;
    const notify = (text) =>
      dispatch(addNotification({ title: 'Info:', text }));
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => notify('Turn link copied to clipboard'))
        .catch(() => prompt('Copy turn link:', url));
    } else {
      // без clipboard API (например, не-HTTPS) — показать ссылку для ручного копирования
      prompt('Copy turn link:', url);
    }
  };

  return (
    <div className="action-icons">
      <a
        key="share"
        className="share-btn"
        data-test-id={TID.turnAction('share')}
        onClick={handleShare}
      >
        <LinkIcon />
      </a>
      <a
        key="clone"
        className="clone-btn"
        data-test-id={TID.turnAction('clone')}
        onClick={handleClone}
      >
        <CopyIcon />
      </a>
      {canEdit && (
        <a
          key="edit"
          className="edit-btn"
          data-test-id={TID.turnAction('edit')}
          onClick={handleEdit}
        >
          <EditIcon />
        </a>
      )}
      {canEdit && (
        <a
          key="front"
          className="front-btn"
          title={t('bringToFront')}
          data-test-id={TID.turnAction('front')}
          onClick={handleFront}
        >
          <BringToFrontIcon />
        </a>
      )}
      {canEdit && (
        <a
          key="back"
          className="back-btn"
          title={t('sendToBack')}
          data-test-id={TID.turnAction('back')}
          onClick={handleBack}
        >
          <SendToBackIcon />
        </a>
      )}
      {canEdit && (
        <a
          key="cut"
          className="cut-btn"
          data-test-id={TID.turnAction('cut')}
          onClick={handleCut}
        >
          <ScissorIcon />
        </a>
      )}
      {canEdit && (
        <a
          key="delete"
          className="delete-btn"
          data-test-id={TID.turnAction('delete')}
          onClick={handleDelete}
        >
          <DeleteIcon />
        </a>
      )}
    </div>
  );
};

export default memo(ButtonsMenu);

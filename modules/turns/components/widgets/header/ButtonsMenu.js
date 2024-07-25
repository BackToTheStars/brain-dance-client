import { memo } from 'react';
import { RULE_TURNS_CRUD } from '@/config/user';
import { togglePanel } from '@/modules/panels/redux/actions';
import {
  PANEL_ADD_EDIT_TURN,
} from '@/modules/panels/settings';
import { cloneTurn, deleteTurn } from '../../../redux/actions';
import { CopyIcon, DeleteIcon, EditIcon, ScissorIcon } from '../../icons/Turn';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { centerViewportAtPosition } from '@/modules/game/game-redux/actions';

const ButtonsMenu = ({ _id }) => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const turnGeometry = useSelector((state) => state.turns.g[_id]);

  const handleCut = (e) => {
    e.preventDefault();
    if (confirm('Точно вырезать?')) {
      dispatch(cloneTurn(_id)).then(() => {
        dispatch(deleteTurn(_id));
      });
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (confirm('Точно удалить?')) {
      dispatch(deleteTurn(_id));
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    dispatch(
      togglePanel({
        type: PANEL_ADD_EDIT_TURN,
        open: true,
        params: { editTurnId: _id },
      }),
    );

    dispatch(
      centerViewportAtPosition({
        x:
          turnGeometry.position.x +
          Math.floor(turnGeometry.size.width / 2) +
          450, // в settings PANEL_ADD_EDIT_TURN ширина 700px
        y: turnGeometry.position.y + Math.floor(turnGeometry.size.height / 2),
      }),
    );
  };

  const handleClone = (e) => {
    e.preventDefault();
    dispatch(cloneTurn(_id));
  };

  return (
    <div className="action-icons">
      <a key="clone" className="clone-btn" onClick={handleClone}>
        <CopyIcon />
      </a>
      {can(RULE_TURNS_CRUD) && (
        <a key="edit" className="edit-btn" onClick={handleEdit}>
          <EditIcon />
        </a>
      )}
      {can(RULE_TURNS_CRUD) && (
        <a key="cut" className="cut-btn" onClick={handleCut}>
          <ScissorIcon />
        </a>
      )}
      {can(RULE_TURNS_CRUD) && (
        <a key="delete" className="delete-btn" onClick={handleDelete}>
          <DeleteIcon />
        </a>
      )}
    </div>
  );
};

export default memo(ButtonsMenu);

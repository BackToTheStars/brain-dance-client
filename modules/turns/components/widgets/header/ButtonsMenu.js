import { RULE_TURNS_CRUD } from '@/config/user';
import { togglePanel } from '@/modules/panels/redux/actions';
import {
  PANEL_ADD_EDIT_TURN,
  PANEL_TURN_INFO,
} from '@/modules/panels/settings';
import { cloneTurn, deleteTurn } from '../../../redux/actions';
import { CopyIcon, DeleteIcon, EditIcon, ScissorIcon } from '../../icons/Turn';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { centerViewportAtPosition } from '@/modules/game/game-redux/actions';

const ButtonsMenu = ({ _id }) => {
  // const handleInfo = (e) => {
  //   dispatch(togglePanel({ type: PANEL_TURN_INFO }));
  //   // dispatch(setTurnToEdit(_id));
  // };
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const turn = useSelector((state) => state.turns.d[_id]);
  const zeroPointId = useSelector((state) => state.turns.zeroPointId);
  const zeroPoint = useSelector((state) => state.turns.d[zeroPointId]);

  const handleCut = (e) => {
    e.preventDefault();
    if (confirm('Точно вырезать?')) {
      // clone();
      // confirm - глобальная функция браузера
      dispatch(cloneTurn(turn)).then(() => {
        dispatch(deleteTurn(_id));
      });
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (confirm('Точно удалить?')) {
      // confirm - глобальная функция браузера
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
      })
    );

    dispatch(
      centerViewportAtPosition({
        x: turn.x - zeroPoint.x + Math.floor(turn.width / 2) + 450, // в settings PANEL_ADD_EDIT_TURN ширина 700px
        y: turn.y - zeroPoint.y + Math.floor(turn.height / 2),
      })
    );
  };

  const handleClone = (e) => {
    e.preventDefault();
    dispatch(cloneTurn(turn));
  };

  return (
    <div className="mod_icon_wrap">
      <a key="clone" className="clone-btn" onClick={handleClone}>
        <CopyIcon />
      </a>
      {can(RULE_TURNS_CRUD) && (
        <a key="edit" className="edit-btn" onClick={handleEdit}>
          {/*<img src="/images/cloud.svg" />*/}
          {/*<i className="fas fa-pen-square"></i>*/}

          <EditIcon />
        </a>
      )}
      {can(RULE_TURNS_CRUD) && (
        <a key="cut" className="cut-btn" onClick={handleCut}>
          {/*<img src="/images/scissor.svg" />*/}
          {/*<i className="fas fa-cut"></i>*/}

          <ScissorIcon />
        </a>
      )}
      {can(RULE_TURNS_CRUD) && (
        <a key="delete" className="delete-btn" onClick={handleDelete}>
          {/*<img src="/images/delete.svg" />*/}
          {/*<i className="fas fa-trash-alt"></i>*/}

          <DeleteIcon />
        </a>
      )}
    </div>
  );
};

export default ButtonsMenu;

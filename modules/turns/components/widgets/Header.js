import { RULE_TURNS_CRUD } from '@/config/user';
import { setTurnToEdit, togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_TOGGLE } from '@/modules/panels/redux/types';
import {
  PANEL_ADD_EDIT_TURN,
  PANEL_TURN_INFO,
} from '@/modules/panels/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import React, { useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cloneTurn, deleteTurn } from '../../redux/actions';
import { CopyIcon, DeleteIcon, EditIcon, ScissorIcon } from '../icons/Turn';
// import { HEADER_HEIGHT } from '@/components/const';
const HEADER_HEIGHT = 105;

const CloneButton = ({ handleClone }) => {
  // const { copyPasteActions: { clone } } = useTurnData();

  return (
    <a key="clone" className="clone-btn" onClick={handleClone}>
      {/*<i className="fas fa-clone"></i>*/}
      <CopyIcon />

      {/*<img src="/images/document.svg" />*/}
    </a>
  );
};

const Header = ({
  registerHandleResize,
  _id,
  header,
  contentType,
  backgroundColor,
  fontColor,
  dontShowHeader,
}) => {
  const headerEl = useRef(null);
  const { can } = useUserContext();
  const remove = () => {};
  const dispatch = useDispatch();
  const turn = useSelector((state) => state.turns.d[_id]);

  const style = useMemo(() => {
    let style = {
      height: `${HEADER_HEIGHT}px`,
    };
    if (contentType === 'comment' && !dontShowHeader) {
      style = { ...style, backgroundColor, color: fontColor || 'black' };
    }
    return style;
  }, [dontShowHeader, backgroundColor, fontColor, contentType]);

  const handleInfo = (e) => {
    dispatch(togglePanel({ type: PANEL_TURN_INFO }));
    // dispatch(setTurnToEdit(_id));
  };

  const handleCut = (e) => {
    e.preventDefault();
    if (confirm('Точно вырезать?')) {
      clone();
      // confirm - глобальная функция браузера
      remove();
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
      togglePanel({ type: PANEL_ADD_EDIT_TURN, params: { editTurnId: _id } })
    );
  };

  const handleClone = (e) => {
    e.preventDefault();
    dispatch(cloneTurn(turn));
  };

  useEffect(() => {
    registerHandleResize({
      type: 'header',
      id: 'header1',
      minWidthCallback: () => 300,
      minHeightCallback: () => (dontShowHeader ? 0 : HEADER_HEIGHT),
      maxHeightCallback: () => (dontShowHeader ? 0 : HEADER_HEIGHT),
    });
  }, [dontShowHeader]);

  return (
    <div className="headerText" ref={headerEl} style={style}>
      <div className="headerTextTitle">{header}</div>
      <div className="mod_icon_wrap">
        {can(RULE_TURNS_CRUD) && (
          <a key="cut" className="cut-btn" onClick={handleCut}>
            {/*<img src="/images/scissor.svg" />*/}
            {/*<i className="fas fa-cut"></i>*/}

            <ScissorIcon />
          </a>
        )}
        <CloneButton handleClone={handleClone} />
        {can(RULE_TURNS_CRUD) && (
          <a key="edit" className="edit-btn" onClick={handleEdit}>
            {/*<img src="/images/cloud.svg" />*/}
            {/*<i className="fas fa-pen-square"></i>*/}

            <EditIcon />
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
      <div className="flex_mod">
        <a href="#" className="flex_mod_site">
          ceur-ws.org
        </a>
        <div className="mod_date">8 July 2021</div>
      </div>
    </div>
  );
};

const MemorizedHeader = React.memo(Header);

export default MemorizedHeader;

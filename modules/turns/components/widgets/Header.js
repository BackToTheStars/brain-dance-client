import { RULE_TURNS_CRUD } from '@/config/user';
import { setTurnToEdit, togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_TOGGLE } from '@/modules/panels/redux/types';
import { PANEL_ADD_EDIT_TURN } from '@/modules/panels/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useDebugValue,
} from 'react';
import { useDispatch } from 'react-redux';
import { deleteTurn } from '../../redux/actions';
// import { HEADER_HEIGHT } from '@/components/const';
const HEADER_HEIGHT = 40;

const CloneButton = () => {
  // const { copyPasteActions: { clone } } = useTurnData();
  const handleClone = async (e) => {
    e.preventDefault();
    // clone();
  };
  return (
    <a key="clone" className="clone-btn" onClick={handleClone}>
      <i className="fas fa-clone"></i>
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

  const style = useMemo(() => {
    let style = {
      height: `${HEADER_HEIGHT}px`,
    };
    if (contentType === 'comment' && !dontShowHeader) {
      style = { ...style, backgroundColor, color: fontColor || 'black' };
    }
    return style;
  }, [dontShowHeader, backgroundColor, fontColor, contentType]);

  const handleCut = async (e) => {
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
    dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
    dispatch(setTurnToEdit(_id));
  };

  useEffect(() => {
    registerHandleResize({
      type: 'header',
      id: 'header',
      minWidthCallback: () => 300,
      minHeightCallback: () => (dontShowHeader ? 0 : HEADER_HEIGHT),
      maxHeightCallback: () => (dontShowHeader ? 0 : HEADER_HEIGHT),
    });
  }, [dontShowHeader]);

  return (
    <h5 className="headerText" ref={headerEl} style={style}>
      <div className="headerTextTitle">{header}</div>
      <div className="headerTextActions">
        {can(RULE_TURNS_CRUD) && (
          <a key="cut" className="cut-btn" onClick={handleCut}>
            <i className="fas fa-cut"></i>
          </a>
        )}
        <CloneButton />
        {can(RULE_TURNS_CRUD) && (
          <a key="edit" className="edit-btn" onClick={handleEdit}>
            <i className="fas fa-pen-square"></i>
          </a>
        )}
        <a key="delete" className="delete-btn" onClick={handleDelete}>
          <i className="fas fa-trash-alt"></i>
        </a>
      </div>
    </h5>
  );
};

const MemorizedHeader = React.memo(Header);

export default MemorizedHeader;

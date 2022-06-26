import { RULE_TURNS_CRUD } from '@/config/user';
import { setTurnToEdit, togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_TOGGLE } from '@/modules/panels/redux/types';
import {
  PANEL_ADD_EDIT_TURN,
  PANEL_TURN_INFO,
} from '@/modules/panels/settings';
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
import { CopyIcon, DeleteIcon, EditIcon, ScissorIcon } from '../icons/Turn';

import { dateFormatter } from '../../../../old/components/helpers/formatters/dateFormatter';
import { getShortLink } from '../../../../old/components/helpers/formatters/urlFormatter';
import { HEADER_HEIGHT } from '@/config/ui';
//const HEADER_HEIGHT = 105;

const CloneButton = () => {
  // const { copyPasteActions: { clone } } = useTurnData();
  const handleClone = async (e) => {
    e.preventDefault();
    // clone();
  };
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
  sourceUrl,
  date
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

  const handleInfo = (e) => {
    dispatch(togglePanel({ type: PANEL_TURN_INFO }));
    // dispatch(setTurnToEdit(_id));
  };

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
    dispatch(
      togglePanel({ type: PANEL_ADD_EDIT_TURN, params: { editTurnId: _id } })
    );
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
        <CloneButton />
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
          {!!(date || sourceUrl) && <div className="flex_mod">
              {!!sourceUrl && <a href={sourceUrl} className="flex_mod_site" target="_blank">
                  {getShortLink(sourceUrl)}
              </a>}

              {!!date && <div className="mod_date">{dateFormatter(date)}</div>}

          </div>}
    </div>
  );
};

const MemorizedHeader = React.memo(Header);

export default MemorizedHeader;

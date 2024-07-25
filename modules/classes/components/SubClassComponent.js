import { Input } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeClass, updateClass } from '../redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { RULE_TURNS_CRUD } from '@/config/user';

const SubClassComponent = ({ subClassItemId }) => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const inputRef = useRef();
  const subClassItem = useSelector((state) => state.classes.d[subClassItemId]);
  const [editTitleMode, setEditTitleMode] = useState(false);

  const [title, setTitle] = useState(subClassItem.title);

  const updateTitle = (e) => {
    e.preventDefault();
    setEditTitleMode(false);
    dispatch(updateClass({ id: subClassItem.id, title }));
  };

  useEffect(() => {
    setTitle(subClassItem.title);
  }, [subClassItem]);

  useEffect(() => {
    if (!editTitleMode) return;
    setTimeout(() => {
      inputRef?.current?.focus();
    }, 200);
  }, [editTitleMode]);

  return (
    <div className="ml-3 class-item flex items-center">
      {editTitleMode ? (
        <form onSubmit={updateTitle} className="flex pt-1 class-title-row">
          <Input
            ref={inputRef}
            className="me-2 flex-grow-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-success btn-sm panel-button">Ok</button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <div className="px-2 py-1">
            {'- '}
            {title}
          </div>
          {can(RULE_TURNS_CRUD) && (
            <div className="flex classes-btn-group">
              <button
                className="btn btn-success btn-sm"
                onClick={(e) => setEditTitleMode(true)}
              >
                <img src="/icons/white/edit.svg" />
              </button>
              <button
                className="btn btn-success btn-sm class-item-delete"
                onClick={() => dispatch(removeClass(subClassItem.id))}
              >
                <img src="/icons/white/delete.svg" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubClassComponent;

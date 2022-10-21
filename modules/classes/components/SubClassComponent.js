import { Input } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeClass, updateClass } from '../redux/actions';

const SubClassComponent = ({ subClassItemId }) => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const subClassItem = useSelector((state) => state.classes.d[subClassItemId]);
  const hash = useSelector((state) => state.game.game.hash);
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
    <div className="class-item ml-3">
      {editTitleMode ? (
        <form onSubmit={updateTitle} className="d-flex pt-1 class-title-row">
          <Input
            ref={inputRef}
            className="me-2 flex-grow-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-success btn-sm panel-button">
            {/* <img src="/icons/ok.svg" /> */}Ok
          </button>
        </form>
      ) : (
        <div className="d-flex class-title-row">
          <div className="me-3 pt-1 ps-2">
            {'- '}
            {title}
          </div>
          <div className="btn-group classes-btn-group">
            {/* <button className="btn btn-success" onClick={handleAddSubClass}>
              <img src="/icons/add.svg" />
            </button> */}
            <button
              className="btn btn-success btn-sm panel-button"
              onClick={(e) => setEditTitleMode(true)}
            >
              <img src="/icons/white/edit.svg" />
            </button>
            <button
              className="btn btn-success btn-sm panel-button"
              onClick={() => dispatch(removeClass(subClassItem.id))}
            >
              <img src="/icons/white/delete.svg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubClassComponent;

import { useState } from 'react';
import {
  useClassContext,
  ACTION_CLASS_DELETE,
  ACTION_CLASS_UPDATE,
} from '../contexts/ClassContext';

const SubClassComponent = ({ subClassItem }) => {
  const [editTitleMode, setEditTitleMode] = useState(false);
  const [title, setTitle] = useState(subClassItem.title);

  const { classesDispatch } = useClassContext();

  const removeSubClass = () => {
    classesDispatch({
      type: ACTION_CLASS_DELETE,
      payload: { id: subClassItem.id },
    });
  };

  const updateTitle = (e) => {
    e.preventDefault();
    setEditTitleMode(false);
    classesDispatch({
      type: ACTION_CLASS_UPDATE,
      payload: { id: subClassItem.id, title },
    });
  };

  return (
    <div className="class-item ml-3">
      {editTitleMode ? (
        <div className="d-flex pt-1 class-title-row">
          <input
            className="mr-2 flex-grow-1"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-success btn-sm" onClick={updateTitle}>
            {/* <img src="/icons/ok.svg" /> */}Ok
          </button>
        </div>
      ) : (
        <div className="d-flex class-title-row">
          <div className="mr-3 pt-1">
            {'- '}
            {title}
          </div>
          <div className="btn-group classes-btn-group">
            {/* <button className="btn btn-success" onClick={handleAddSubClass}>
              <img src="/icons/add.svg" />
            </button> */}
            <button
              className="btn btn-success btn-sm"
              onClick={(e) => setEditTitleMode(true)}
            >
              <img src="/icons/edit.svg" />
            </button>
            <button className="btn btn-success btn-sm" onClick={removeSubClass}>
              <img src="/icons/delete.svg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubClassComponent;

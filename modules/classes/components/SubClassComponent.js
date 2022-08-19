import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeClass, updateClass } from '../redux/actions';

const SubClassComponent = ({ subClassItemId }) => {
  const dispatch = useDispatch();
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

  return (
    <div className="class-item ml-3">
      {editTitleMode ? (
        <form onSubmit={updateTitle} className="d-flex pt-1 class-title-row">
          <input
            className="mr-2 flex-grow-1"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-success btn-sm">
            {/* <img src="/icons/ok.svg" /> */}Ok
          </button>
        </form>
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
            <button
              className="btn btn-success btn-sm"
              onClick={() => dispatch(removeClass(subClassItem.id))}
            >
              <img src="/icons/delete.svg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubClassComponent;

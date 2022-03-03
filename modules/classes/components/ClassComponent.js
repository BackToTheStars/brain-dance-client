import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeClass, updateClass } from '../redux/actions';
import SubClassList from './SubClassList';
// import { useClassContext } from '../contexts/ClassContext';

const ClassComponent = ({ classItemId, _id }) => {
  // const { removeClass, updateClass } = useClassContext();
  const dispatch = useDispatch();

  const classItem = useSelector((state) => state.classes.d[classItemId]);
  const hash = useSelector((state) => state.game.game.hash);

  const [editTitleMode, setEditTitleMode] = useState(false);
  const [title, setTitle] = useState(classItem.title);

  const [editSubclassMode, setEditSubclassMode] = useState(false);

  const updateTitle = (e) => {
    e.preventDefault();
    setEditTitleMode(false);
    dispatch(updateClass(hash, { id: classItem.id, title }));
    // classesDispatch({
    //   type: ACTION_CLASS_UPDATE,
    //   payload: { id: classItem.id, title },
    // });
  };

  const handleAddSubClass = (e) => {
    e.preventDefault();
    setEditSubclassMode(!editSubclassMode);
  };

  // const removeClass = () => {
  //   classesDispatch({
  //     type: ACTION_CLASS_DELETE,
  //     payload: { id: classItem.id },
  //   });
  //   // setClasses(classes.filter((classItem) => classItem.id !== classId));
  // };

  useEffect(() => {
    setTitle(classItem.title);
  }, [classItem]);

  return (
    <div className="class-item mb-2">
      {editTitleMode ? (
        <form onSubmit={updateTitle} className="d-flex class-title-row">
          <input
            className="mr-2 flex-grow-1"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-success">
            {/* <img src="/icons/ok.svg" /> */}Ok
          </button>
        </form>
      ) : (
        <div className="d-flex class-title-row">
          <div className="mr-3 pt-1 ">{title}</div>
          <div className="btn-group classes-btn-group">
            <button
              className="btn btn-success btn-sm"
              onClick={handleAddSubClass}
            >
              {editSubclassMode ? (
                <img src="/icons/minus.svg" />
              ) : (
                <img src="/icons/add.svg" />
              )}
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={(e) => setEditTitleMode(true)}
            >
              <img src="/icons/edit.svg" />
            </button>

            {!classItem?.children?.length && ( // @learn
              <button
                className="btn btn-success btn-sm"
                onClick={() => dispatch(removeClass(hash, classItem.id))}
              >
                <img src="/icons/delete.svg" />
              </button>
            )}
          </div>
        </div>
      )}

      <SubClassList
        {...{
          parentId: classItemId,
          editSubclassMode,
          setEditSubclassMode,
          subClasses: classItem.children,
        }}
      />
    </div>
  );
};

export default ClassComponent;

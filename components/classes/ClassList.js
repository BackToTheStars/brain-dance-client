import { useState } from 'react';
import ClassComponent from './ClassComponent';
import { useClassContext, ACTION_CLASS_ADD } from '../contexts/ClassContext';

const ClassList = () => {
  const {
    classesTree: classes,
    classesDispatch,
    createClass,
  } = useClassContext();

  // const [classes, setClasses] = useState(classesTree);
  const [title, setTitle] = useState('');

  createTurn(turnObj, {
    successCallback: (data) => {
      // console.log('успешный коллбэк на уровне Попапа');
      setCreateEditTurnPopupIsHidden(true);
      dispatch({
        type: ACTION_TURN_CREATED,
        payload: {
          ...data.item,
          x: data.item.x + zeroPointX,
          y: data.item.y + zeroPointY,
        },
      });
    },
    errorCallback: (message) => {
      setError({ message });
    },
  });

  const addClass = (e) => {
    e.preventDefault();
    classesDispatch({
      type: ACTION_CLASS_ADD,
      payload: { title },
    });
    setTitle('');
  };

  return (
    <div className="p-2 d-flex flex-column h-100">
      {classes.map((classItem, i) => (
        <ClassComponent key={classItem.id} classItem={classItem} />
      ))}
      <div className="flex-grow-1"></div>
      <form className="form-inline d-flex" onSubmit={addClass}>
        <input
          type="text"
          value={title}
          className="form-group mr-2 flex-grow-1"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <button className="btn btn-primary">Add</button>
      </form>
    </div>
  );
};

export default ClassList;

import { useState } from 'react';
import ClassComponent from './ClassComponent';
import { useClassContext, ACTION_CLASS_ADD } from '../contexts/ClassContext';

const ClassList = () => {
  const {
    classesTree: classes,
    classesDispatch,
    createClass,
    getNextId,
    getNameAlias,
    reloadClasses,
  } = useClassContext();

  // const [classes, setClasses] = useState(classesTree);
  const [title, setTitle] = useState('');

  const addClass = (e) => {
    e.preventDefault();
    // подготовить данные для payload
    const nextId = getNextId();
    const payload = { id: nextId, title, name: getNameAlias(title, nextId) };
    classesDispatch({
      type: ACTION_CLASS_ADD,
      payload,
    });
    createClass(payload, {
      successCallback: (data) => {},
      errorCallback: (message) => {
        reloadClasses();
      },
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

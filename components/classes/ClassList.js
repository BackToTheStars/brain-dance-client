import { useState } from 'react';
import ClassComponent from './ClassComponent';
import { getNextId } from './functions';
import { useClassContext, ACTION_CLASS_ADD } from '../contexts/ClassContext';

const ClassList = () => {
  const { classesTree: classes, classesDispatch } = useClassContext();

  // const [classes, setClasses] = useState(classesTree);
  const [title, setTitle] = useState('');

  const removeClass = (classId) => {
    // setClasses(classes.filter((classItem) => classItem.id !== classId));
  };

  const addClass = (e) => {
    e.preventDefault();
    // const newClasses = [
    //   ...classes,
    //   {
    //     id: getNextId(classes),
    //     title,
    //     subClasses: [],
    //   },
    // ];
    classesDispatch({
      type: ACTION_CLASS_ADD,
      payload: {
        id: getNextId(classes),
        title,
        children: [],
      },
    });
    setTitle('');
  };

  return (
    <div className="p-2 d-flex flex-column h-100">
      {classes.map((classItem, i) => (
        <ClassComponent
          key={classItem.id}
          classItem={classItem}
          removeClass={removeClass}
        />
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

import { useState } from 'react';
import ClassComponent from './ClassComponent';
// import { useClassContext } from '../contexts/ClassContext';

const ClassList = () => {
  // const { classesTree: classes, addClass } = useClassContext();
  const classes = [];
  const addClass = () => {};

  // const [classes, setClasses] = useState(classesTree);
  const [title, setTitle] = useState('');

  const submitAddClass = (e) => {
    e.preventDefault();
    // подготовить данные для payload
    addClass(title);
    setTitle('');
  };

  return (
    <div className="p-2 d-flex flex-column h-100">
      {classes.map((classItem, i) => (
        <ClassComponent key={classItem.id} classItemId={classItem.id} />
      ))}
      <div className="flex-grow-1"></div>
      <form className="add-class form-inline d-flex" onSubmit={submitAddClass}>
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

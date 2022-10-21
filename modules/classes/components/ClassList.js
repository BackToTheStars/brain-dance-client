import { Input } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addClass, loadClasses } from '../redux/actions';
import ClassComponent from './ClassComponent';
// import { useClassContext } from '../contexts/ClassContext';

const ClassList = () => {
  const classes = useSelector((state) => state.classes.classesTree);
  const maxId = useSelector((state) => state.classes.maxId);

  // const [classes, setClasses] = useState(classesTree);
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();

  const submitAddClass = (e) => {
    e.preventDefault();
    // подготовить данные для payload
    // addClass(title);
    dispatch(addClass(title, maxId + 1));
    setTitle('');
  };

  useEffect(() => {
    dispatch(loadClasses());
  }, []);

  return (
    <div className="class-list p-2 d-flex flex-column h-100">
      {classes.map((classItem, i) => (
        <ClassComponent
          key={classItem.id}
          classItemId={classItem.id}
          _id={classItem._id}
        />
      ))}
      <div className="flex-grow-1"></div>
      <form className="add-class form-inline d-flex" onSubmit={submitAddClass}>
        <Input
          value={title}
          className="form-group me-2 flex-grow-1"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          placeholder="Enter class name..."
        />
        <button className="btn btn-primary panel-button">Add</button>
      </form>
    </div>
  );
};

export default ClassList;

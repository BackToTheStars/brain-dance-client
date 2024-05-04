import { Input } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addClass, loadClasses } from '../redux/actions';
import ClassComponent from './ClassComponent';

const ClassList = () => {
  const classes = useSelector((state) => state.classes.classesTree);
  const maxId = useSelector((state) => state.classes.maxId);

  const [title, setTitle] = useState('');
  const dispatch = useDispatch();

  const submitAddClass = (e) => {
    e.preventDefault();
    dispatch(addClass(title, maxId + 1));
    setTitle('');
  };

  useEffect(() => {
    dispatch(loadClasses());
  }, []);

  return (
    <div className="class-list p-2 flex flex-col h-full base-ff">
      {classes.map((classItem, i) => (
        <ClassComponent
          key={classItem.id}
          classItemId={classItem.id}
          _id={classItem._id}
        />
      ))}
      <div className="flex-grow" />
      <form className="flex items-center gap-2" onSubmit={submitAddClass}>
        <Input
          type="text"
          className="border border-gray-300 rounded px-2 py-1 flex-1"
          placeholder="Enter class name..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <button className="btn btn-primary p-2">Add</button>
      </form>
    </div>
  );
};

export default ClassList;

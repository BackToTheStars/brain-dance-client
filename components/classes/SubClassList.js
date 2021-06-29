import { useState } from 'react';
import SubClassComponent from './SubClassComponent';
import { useClassContext, ACTION_CLASS_ADD } from '../contexts/ClassContext';

const SubClassList = ({
  editSubclassMode,
  setEditSubclassMode,
  subClasses = [],
  parentId,
}) => {
  const { classesDispatch } = useClassContext();

  // const [subClasses, setSubClasses] = useState(subClassesList);
  const [subClassTitle, setSubClassTitle] = useState('');

  const addSubClass = (e) => {
    e.preventDefault();

    classesDispatch({
      type: ACTION_CLASS_ADD,
      payload: { parentId, title: subClassTitle },
    });

    // const newSubClasses = [
    //   ...subClasses,
    //   {
    //     id: getNextId(subClasses),
    //     title: subClassTitle,
    //   },
    // ];
    // setSubClasses(newSubClasses);
    setEditSubclassMode(false);
    setSubClassTitle('');
  };

  return (
    <>
      {subClasses.map((subClass) => (
        <SubClassComponent key={subClass.id} subClassItem={subClass} />
      ))}
      {editSubclassMode && (
        <div className="p-2">
          <form className="form-inline d-flex" onSubmit={addSubClass}>
            <input
              className="mr-2 flex-grow-1"
              type="text"
              value={subClassTitle}
              onChange={(e) => setSubClassTitle(e.target.value)}
            />
            <button className="btn btn-success">Add</button>
          </form>
        </div>
      )}
    </>
  );
};

export default SubClassList;

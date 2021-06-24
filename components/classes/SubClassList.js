import { useState } from 'react';
import { getNextId } from './functions';
import SubClassComponent from './SubClassComponent';

const SubClassList = ({ editSubclassMode, setEditSubclassMode }) => {
  const [subClasses, setSubClasses] = useState([]);
  const [subClassTitle, setSubClassTitle] = useState('');

  const addSubClass = (e) => {
    e.preventDefault();
    const newSubClasses = [
      ...subClasses,
      {
        id: getNextId(subClasses),
        title: subClassTitle,
      },
    ];
    setSubClasses(newSubClasses);
    setEditSubclassMode(false);
    setSubClassTitle('');
  };

  const removeSubClass = (id) => {
    const newSubClasses = setSubClasses(
      subClasses.filter((subClassItem) => subClassItem.id !== id)
    );
  };

  return (
    <>
      {subClasses.map((subClass) => (
        <SubClassComponent
          key={subClass.id}
          subClassItem={subClass}
          removeSubClass={removeSubClass}
        />
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
            <button className="btn btn-success" onClick={addSubClass}>
              Add
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SubClassList;

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { addClass } from '../redux/actions';
import SubClassComponent from './SubClassComponent';
// import { useClassContext } from '../contexts/ClassContext';

const SubClassList = ({
  editSubclassMode,
  setEditSubclassMode,
  subClasses = [],
  parentId,
}) => {
  const hash = useSelector((state) => state.game.game.hash);

  const [subClassTitle, setSubClassTitle] = useState('');

  const addSubClass = (e) => {
    e.preventDefault();
    addClass(hash, subClassTitle, parentId);
    setEditSubclassMode(false);
    setSubClassTitle('');
  };

  return (
    <>
      {subClasses.map((subClass) => (
        <SubClassComponent key={subClass.id} subClassItemId={subClass.id} />
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

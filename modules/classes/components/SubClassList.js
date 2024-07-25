import { Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addClass } from '../redux/actions';
import SubClassComponent from './SubClassComponent';
// import { useClassContext } from '../contexts/ClassContext';

const SubClassList = ({
  editSubclassMode,
  setEditSubclassMode,
  subClasses = [],
  parentId,
}) => {
  const maxId = useSelector((state) => state.classes.maxId);
  const dispatch = useDispatch();
  const inputRef = useRef();

  const [subClassTitle, setSubClassTitle] = useState('');

  const addSubClass = (e) => {
    e.preventDefault();
    dispatch(addClass(subClassTitle, maxId + 1, parentId));
    setEditSubclassMode(false);
    setSubClassTitle('');
  };

  useEffect(() => {
    if (!editSubclassMode) return;
    setTimeout(() => {
      inputRef?.current?.focus();
    }, 200);
  }, [editSubclassMode]);

  return (
    <>
      {subClasses.map((subClass) => (
        <SubClassComponent key={subClass.id} subClassItemId={subClass.id} />
      ))}
      {editSubclassMode && (
        <div className="p-2">
          <form className="form-inline flex" onSubmit={addSubClass}>
            <Input
              ref={inputRef}
              className="me-2 flex-grow-1"
              value={subClassTitle}
              onChange={(e) => setSubClassTitle(e.target.value)}
            />
            <button className="btn btn-success panel-button">Add</button>
          </form>
        </div>
      )}
    </>
  );
};

export default SubClassList;

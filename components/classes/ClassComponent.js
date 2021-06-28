import { useState } from 'react';
import SubClassList from './SubClassList';

const ClassComponent = ({ classItem, removeClass }) => {
  console.log('ClassComponent');
  const [editTitleMode, setEditTitleMode] = useState(false);
  const [title, setTitle] = useState(classItem.title);

  // для SubClasses
  const [editSubclassMode, setEditSubclassMode] = useState(false);
  const [subClassTitle, setSubClassTitle] = useState('');

  const handleAddSubClass = (e) => {
    e.preventDefault();
    setEditSubclassMode(true);
  };

  return (
    <div className="class-item mb-3">
      {editTitleMode ? (
        <div className="d-flex class-title-row">
          <input
            className="mr-2 flex-grow-1"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            className="btn btn-success"
            onClick={(e) => setEditTitleMode(false)}
          >
            {/* <img src="/icons/ok.svg" /> */}Ok
          </button>
        </div>
      ) : (
        <div className="d-flex pt-2 class-title-row">
          <div className="mr-3">{title}</div>
          <div className="btn-group classes-btn-group">
            <button className="btn btn-success" onClick={handleAddSubClass}>
              <img src="/icons/add.svg" />
            </button>
            <button
              className="btn btn-success"
              onClick={(e) => setEditTitleMode(true)}
            >
              <img src="/icons/edit.svg" />
            </button>
            <button
              className="btn btn-success"
              onClick={() => removeClass(classItem.id)}
            >
              <img src="/icons/delete.svg" />
            </button>
          </div>
        </div>
      )}
      <SubClassList
        {...{
          editSubclassMode,
          setEditSubclassMode,
          subClasses: classItem.children,
        }}
      />
    </div>
  );
};

export default ClassComponent;

import { useUiContext } from '../contexts/UI_Context';
import { useEffect, useState } from 'react';
import { panelSpacer } from './сonst';

const ClassesPanel = () => {
  const {
    state: { classesPanelIsHidden },
    minimapState: { minimapSize, isHidden },
  } = useUiContext();

  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (classesPanelIsHidden) return;
    if (isHidden) {
      setHeight(window.innerHeight - 2 * panelSpacer); // отправили доступную высоту для панели классов в State
    } else {
      setHeight(minimapSize.top - 2 * panelSpacer);
    }
  }, [minimapSize, isHidden, classesPanelIsHidden]);

  return (
    <div
      className={`${classesPanelIsHidden ? 'hidden' : ''} po panel`}
      id="classMenu"
      style={{ height: `${height}px` }}
    >
      <ClassList />
    </div>
  );
};

const getNextId = (classes) => {
  let max = 1;
  for (const classItem of classes) {
    if (classItem.id > max) {
      max = classItem.id;
    }
  }
  return max + 1;
};

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [title, setTitle] = useState('');

  const removeClass = (classId) => {
    setClasses(classes.filter((classItem) => classItem.id !== classId));
  };

  const addClass = (e) => {
    e.preventDefault();
    setClasses([
      ...classes,
      {
        id: getNextId(classes),
        title,
      },
    ]);
    setTitle('');
  };

  return (
    <div className="p-2">
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
      {classes.map((classItem, i) => (
        <ClassComponent
          key={classItem.id}
          classItem={classItem}
          removeClass={removeClass}
        />
      ))}
    </div>
  );
};

export const ClassComponent = ({ classItem, removeClass }) => {
  const [editTitleMode, setEditTitleMode] = useState(false);
  const [title, setTitle] = useState(classItem.title);

  return (
    <div className="class-item">
      {editTitleMode ? (
        <div className="d-flex pt-2 class-title-row">
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
            <button className="btn btn-success">
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
    </div>
  );
};

// создаётся на 64 строчке в src/game.js
// class GameClassPanel {
//   constructor(divName) {
//     this.rootElement = document.getElementById(divName);
//     this.gameClasses = [];
//     this.gameClassDescs = undefined;
//     this.addNewClassBlock = undefined;
//     this.inputEl = undefined;
//     this.buttonEl = undefined;
//     this.prerender().then(() => {
//       this.render();
//     });
//   }

//   async load() {
//     // получение классов
//     const res = await getClasses();
//     this.gameClassDescs = res.items;
//   }

//   async prerender() {
//     this.addIcon = document.createElement('img');
//     this.addIcon.src = './icons/add.svg';
//     this.addIcon.style.display = 'block';
//     this.addIcon.style.cursor = 'pointer';
//     this.addIcon.onclick = () => {
//       this.addIcon.style.display = 'none';
//       this.addNewClassBlockHiddenBlock.style.display = 'block';
//     };

//     this.addNewClassBlock = document.createElement('div');
//     this.addNewClassBlock.className = 'col-12';

//     this.addNewClassBlockHiddenBlock = document.createElement('div');
//     this.addNewClassBlockHiddenBlock.innerHTML = `<span class="prompt">Add class:</span>`;

//     this.inputEl = document.createElement('input');
//     this.addNewClassBlockHiddenBlock.appendChild(this.inputEl);

//     this.buttonAddEl = document.createElement('button');
//     this.buttonAddEl.innerText = 'Add';
//     this.buttonAddEl.onclick = () => {
//       this.onClickAddNewClass();
//       this.addIcon.style.display = 'block';
//       this.addNewClassBlockHiddenBlock.style.display = 'none';
//     };
//     this.addNewClassBlockHiddenBlock.appendChild(this.buttonAddEl);

//     this.buttonCancelEl = document.createElement('button');
//     this.buttonCancelEl.innerText = 'Cancel';
//     this.buttonCancelEl.onclick = () => {
//       this.inputEl.value = '';
//       this.addIcon.style.display = 'block';
//       this.addNewClassBlockHiddenBlock.style.display = 'none';
//     };
//     this.addNewClassBlockHiddenBlock.appendChild(this.buttonCancelEl);

//     this.addNewClassBlockHiddenBlock.style.display = 'none';

//     this.addNewClassBlock.appendChild(this.addIcon);
//     this.addNewClassBlock.appendChild(this.addNewClassBlockHiddenBlock);
//   }

//   async render() {
//     this.rootElement.innerHTML = '';
//     this.rootElement.appendChild(this.addNewClassBlock);
//     await this.load();
//     //console.log(JSON.stringify(this.gameClassDescs));
//     this.gameClasses = [];
//     this.gameClassDescs.forEach((classDesc) => {
//       this.gameClasses.push(
//         new GameClass({
//           panel: this,
//           name: classDesc.gameClass,
//           subClasses: classDesc.subClasses,
//           dbId: classDesc._id,
//           rootToAppend: this.rootElement,
//           sync: false,
//         })
//       );
//     });
//   }

//   async onClickAddNewClass() {
//     const newClassName = this.inputEl.value;
//     this.inputEl.value = '';
//     this.gameClasses.push(
//       new GameClass({
//         panel: this,
//         name: newClassName,
//         rootToAppend: this.rootElement,
//         sync: true,
//       })
//     );
//     console.log(`onClickAddNewClass: ${this.gameClasses.length}`);
//   }

//   async deleteClass(obj) {
//     const ind = this.gameClasses.indexOf(obj);
//     if (ind == -1) {
//       console.log(
//         `ERROR: deleteClass: ind == -1 | obj = ${JSON.stringify(obj)}`
//       );
//     } else {
//       this.gameClasses.splice(ind, 1);
//     }
//   }
// }

export default ClassesPanel;

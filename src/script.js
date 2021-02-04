import { getClasses, createClass, updateClass, deleteClass } from './service';

import { API_URL } from './config';

const urlParams = new URLSearchParams(window.location.search);
const HASH = urlParams.get('hash');

class GameClass {
  constructor(obj) {
    const { panel, name, rootToAppend, subClasses, dbId, sync } = obj;
    this.panel = panel;
    this.name = name;
    this.dbId = dbId;
    this.rootToAppend = rootToAppend;
    this.subClassNames = subClasses || [];
    this.sync = sync; // говорит что этот класс нужно отправить на сервер
    if (sync) {
      const body = {
        gameClass: name,
      };
      // добавление класса
      // const bodyJSON = JSON.stringify(body);
      // fetch(`${API_URL}/game-classes?hash=${HASH}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Content-Length': bodyJSON.length,
      //   },
      //   body: bodyJSON,
      // })
      // .then(
      // (res) => {
      // res.json()
      createClass(body).then(
        (json) => {
          const { _id } = json.item;
          console.log(_id);
          this.dbId = _id; // эта строчка, похоже, ни на что не влияет
          this.prerender().then(() => {
            this.render();
          });
        },
        (err) => {
          console.log(`ERROR: GameClass: construtor: fetch: not JSON: ${err}`);
        }
      );
      // },
      // (err) => {
      //   console.log(`ERROR: ${bodyJSON}: sending failed`);
      // }
      // );
    } else {
      this.prerender().then(() => {
        this.render().then(() => {
          this.subClassNames.forEach((name) => {
            this.renderSubclass({ subClassName: name });
          });
        });
      });
    }
  }

  async prerender() {
    this.self = document.createElement('div');
    this.self.className = 'class-list col-12';

    this.subClasses = document.createElement('div');
    this.subClasses.className = 'subclasses-block';

    this.titleBlock = document.createElement('div');
    this.titleBlock.className = 'title-block';

    this.titleName = document.createElement('div');
    this.titleName.style.flexGrow = 1;
    this.titleName.style.flexShrink = 1;
    this.titleName.innerText = this.name;

    this.titleNameInput = document.createElement('input');
    this.titleNameInput.className = 'title-name-input';
    this.titleNameInput.addEventListener('keyup', (ev) => {
      ev.preventDefault();
      if (ev.keyCode === 13) {
        // @todo: change deprecated 'keyCode'
        const val = this.titleNameInput.value;
        if (val.trim() != '') {
          const bodyObj = {
            id: this.dbId,
            gameClass: val.trim(),
          };
          this.titleName.innerHTML = '';
          this.titleName.innerText = this.name;
          // редактирование названия класса
          // const bodyJSON = JSON.stringify(bodyObj);
          updateClass(this.dbId, bodyObj)
            // fetch(`${API_URL}/game-classes/${this.dbId}?hash=${HASH}`, {
            //   method: 'PUT',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'Content-Length': bodyJSON.length,
            //   },
            //   body: bodyJSON,
            // })
            .then(
              (res) => {
                // if (res.status == 200) {
                this.name = bodyObj.gameClass;
                this.titleName.innerHTML = '';
                this.titleName.innerText = this.name;
                // } else {
                //   console.log(
                //     `ERROR: res.status = ${res.status} | res = ${JSON.stringify(
                //       res
                //     )}`
                //   );
                // }
              }
              // (err) => {
              //   console.log(err);
              // }
            );
        }
      }
    });

    this.titleButtonsArray = [];

    this.titleButtons = document.createElement('div');
    this.titleButtons.className = 'title-buttons';

    this.titleButtonAdd = document.createElement('button');
    this.titleButtonAdd.className = 'title-button-add';
    this.titleButtonAdd.onclick = () => {
      this.input.style.display = 'inline-block';
      this.buttonAddSubclass.style.display = 'inline-block';
      this.buttonCancelInput.style.display = 'inline-block';
    };

    this.titleButtonEdit = document.createElement('button');
    this.titleButtonEdit.className = 'title-button-edit';
    this.titleButtonEdit.onclick = this.titleEdit.bind(this);

    this.titleButtonDelete = document.createElement('button');
    this.titleButtonDelete.className = 'title-button-delete';
    this.titleButtonDelete.onclick = this.delete.bind(this);

    //this.titleButtons.appendChild(this.titleButtonAdd);
    //this.titleButtons.appendChild(this.titleButtonEdit);
    //this.titleButtons.appendChild(this.titleButtonDelete);

    this.titleButtons.style.display = 'none';

    this.titleBlock.appendChild(this.titleName);
    //this.titleBlock.appendChild(this.titleButtons);

    this.titleButtonsArray.push(this.titleButtonAdd);
    this.titleButtonsArray.push(this.titleButtonEdit);
    this.titleButtonsArray.push(this.titleButtonDelete);

    this.titleButtonsArray.forEach((it) => {
      it.style.display = 'none';
    });

    this.titleBlock.appendChild(this.titleButtonAdd);
    this.titleBlock.appendChild(this.titleButtonEdit);
    this.titleBlock.appendChild(this.titleButtonDelete);

    this.titleBlock.onmouseover = () => {
      //this.titleButtons.style.display = 'block';
      this.titleButtonsArray.forEach((it) => {
        it.style.display = 'block';
      });
    };

    this.titleBlock.onmouseleave = () => {
      this.titleButtonsArray.forEach((it) => {
        it.style.display = 'none';
      });
      //this.titleButtons.style.display = 'none';
    };

    this.input = document.createElement('input');
    this.input.className = 'col-5';
    this.input.style.display = 'none';

    this.buttonAddSubclass = document.createElement('button');
    this.buttonAddSubclass.className = 'add-element';
    this.buttonAddSubclass.onclick = () => {
      this.onClickAddSubclass({ sync: true });
    };
    this.buttonAddSubclass.innerText = 'Add';
    this.buttonAddSubclass.style.display = 'none';

    this.buttonCancelInput = document.createElement('button');
    this.buttonCancelInput.className = 'cancel-input';
    this.buttonCancelInput.innerText = 'Cancel';
    this.buttonCancelInput.onclick = () => {
      this.buttonAddSubclass.style.display = 'none';
      this.buttonCancelInput.style.display = 'none';
      this.input.style.display = 'none';
      this.input.value = '';
    };
    this.buttonCancelInput.style.display = 'none';

    this.self.appendChild(this.titleBlock);
    this.self.appendChild(this.subClasses);
    this.self.appendChild(this.input);
    this.self.appendChild(this.buttonAddSubclass);
    this.self.appendChild(this.buttonCancelInput);
  }

  async render() {
    this.rootToAppend.appendChild(this.self);
    //console.log(`${this.name}: id = ${this.dbId}`);
  }

  // удаление класса
  async delete() {
    deleteClass(this.dbId)
      // fetch(`${API_URL}/game-classes/${this.dbId}?hash=${HASH}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // })
      .then((res) => {
        // if (res.status == 200) {
        this.self.remove();
        this.panel.deleteClass(this);
        // } else {
        //   console.log(
        //     `ERROR: res.status = ${res.status} | ${JSON.stringify(res)}`
        //   );
        // }
      });
  }

  async titleEdit() {
    this.titleNameInput.value = this.name;
    this.titleName.innerHTML = '';
    this.titleName.appendChild(this.titleNameInput);
  }

  async onClickAddSubclass(obj) {
    console.log('onClickAddSubClass');
    const { sync, subClassName } = obj;
    if (sync) {
      const bodyObj = {
        id: this.dbId,
        addNewSubclass: this.input.value.replace(/\s+/, ' '),
      };
      // добавление элемента класса
      // const bodyJSON = JSON.stringify(bodyObj);
      updateClass(this.dbId, bodyObj)
        // fetch(`${API_URL}/game-classes/${this.dbId}?hash=${HASH}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Content-Length': bodyJSON.length,
        //   },
        //   body: bodyJSON,
        // })
        .then(
          () => {
            this.renderSubclass({ subClassName: bodyObj.addNewSubclass });
            this.subClassNames.push(bodyObj.addNewSubclass);
          }
          // (err) => {
          //   console.log(JSON.stringify(err));
          // }
        );
      this.input.value = '';
      this.input.style.display = 'none';
      this.buttonAddSubclass.style.display = 'none';
      this.buttonCancelInput.style.display = 'none';
    } else {
      this.subClassNames.push(subClassName);
    }
  }

  renderSubclass(obj) {
    const value = obj.subClassName;
    const li = document.createElement('div');
    li.className = 'el';
    const liName = document.createElement('p');
    liName.innerText = value;
    li.appendChild(liName);
    const buttonEdit = document.createElement('button');
    buttonEdit.className = 'title-button-edit';
    const input = document.createElement('input');
    buttonEdit.onclick = () => {
      input.value = liName.innerText;
      liName.style.display = 'none';
      liName.after(input);
      input.addEventListener('keyup', (ev) => {
        ev.preventDefault();
        if (ev.keyCode == 13) {
          const val = input.value;
          input.remove();
          liName.style.display = 'block';
          const bodyObj = {
            id: this.dbId,
            renameSubclass: {
              from: liName.innerText,
              to: val,
            },
          };
          // переименование элемента класса
          // const bodyJSON = JSON.stringify(bodyObj);
          updateClass(this.dbId, bodyObj)
            // fetch(`${API_URL}/game-classes/${this.dbId}?hash=${HASH}`, {
            //   method: 'PUT',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'Content-Length': bodyJSON.length,
            //   },
            //   body: bodyJSON,
            // })
            .then(
              (res) => {
                if (res.status == 200) {
                  liName.innerText = val;
                } else {
                  console.log(`res.status == ${res.status}`);
                }
              }
              // (err) => {
              //   console.log(err);
              // }
            );
        }
      });
    };
    const buttonDelete = document.createElement('button');
    buttonDelete.className = 'title-button-delete';
    buttonDelete.onclick = () => {
      const bodyObj = {
        id: this.dbId,
        subClassToDelete: liName.innerText,
      };
      // удаление элемента класса
      // const bodyJSON = JSON.stringify(bodyObj);
      updateClass(this.dbId, bodyObj)
        // fetch(`${API_URL}/game-classes/${this.dbId}?hash=${HASH}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Content-Length': bodyJSON.length,
        //   },
        //   body: bodyJSON,
        // })
        .then(
          (res) => {
            //console.log(`just for logging: ${res.status}`);
            // if (res.status === 200) {
            li.remove();
            const ind = this.subClassNames.indexOf(bodyObj.subClassToDelete);
            if (ind === -1) {
              console.log(
                `buttonDelete for SubClass: "${bodyObj.subClassToDelete}" not found: ind === -1`
              );
              console.log(this.subClassNames);
            } else {
              this.subClassNames.splice(ind, 1);
            }
            // } else {
            //   console.log(`ERROR: /gameClass res.status =  ${res.status}`);
            // }
          },
          (err) => {
            console.log(err);
          }
        );
    };

    li.onmouseover = () => {
      li.appendChild(buttonEdit);
      li.appendChild(buttonDelete);
    };
    li.onmouseleave = () => {
      buttonDelete.remove();
      buttonEdit.remove();
    };
    this.subClasses.appendChild(li);
  }
}

class GameClassPanel {
  constructor(divName) {
    this.rootElement = document.getElementById(divName);
    this.gameClasses = [];
    this.gameClassDescs = undefined;
    this.addNewClassBlock = undefined;
    this.inputEl = undefined;
    this.buttonEl = undefined;
    this.prerender().then(() => {
      this.render();
    });
  }

  async load() {
    // получение классов
    const res = await getClasses();
    this.gameClassDescs = res.items;
  }

  async prerender() {
    this.addIcon = document.createElement('img');
    this.addIcon.src = './icons/add.svg';
    this.addIcon.style.display = 'block';
    this.addIcon.style.cursor = 'pointer';
    this.addIcon.onclick = () => {
      this.addIcon.style.display = 'none';
      this.addNewClassBlockHiddenBlock.style.display = 'block';
    };

    this.addNewClassBlock = document.createElement('div');
    this.addNewClassBlock.className = 'col-12';

    this.addNewClassBlockHiddenBlock = document.createElement('div');
    this.addNewClassBlockHiddenBlock.innerHTML = `<span class="prompt">Add class:</span>`;

    this.inputEl = document.createElement('input');
    this.addNewClassBlockHiddenBlock.appendChild(this.inputEl);

    this.buttonAddEl = document.createElement('button');
    this.buttonAddEl.innerText = 'Add';
    this.buttonAddEl.onclick = () => {
      this.onClickAddNewClass();
      this.addIcon.style.display = 'block';
      this.addNewClassBlockHiddenBlock.style.display = 'none';
    };
    this.addNewClassBlockHiddenBlock.appendChild(this.buttonAddEl);

    this.buttonCancelEl = document.createElement('button');
    this.buttonCancelEl.innerText = 'Cancel';
    this.buttonCancelEl.onclick = () => {
      this.inputEl.value = '';
      this.addIcon.style.display = 'block';
      this.addNewClassBlockHiddenBlock.style.display = 'none';
    };
    this.addNewClassBlockHiddenBlock.appendChild(this.buttonCancelEl);

    this.addNewClassBlockHiddenBlock.style.display = 'none';

    this.addNewClassBlock.appendChild(this.addIcon);
    this.addNewClassBlock.appendChild(this.addNewClassBlockHiddenBlock);
  }

  async render() {
    this.rootElement.innerHTML = '';
    this.rootElement.appendChild(this.addNewClassBlock);
    await this.load();
    //console.log(JSON.stringify(this.gameClassDescs));
    this.gameClasses = [];
    this.gameClassDescs.forEach((classDesc) => {
      this.gameClasses.push(
        new GameClass({
          panel: this,
          name: classDesc.gameClass,
          subClasses: classDesc.subClasses,
          dbId: classDesc._id,
          rootToAppend: this.rootElement,
          sync: false,
        })
      );
    });
  }

  async onClickAddNewClass() {
    const newClassName = this.inputEl.value;
    this.inputEl.value = '';
    this.gameClasses.push(
      new GameClass({
        panel: this,
        name: newClassName,
        rootToAppend: this.rootElement,
        sync: true,
      })
    );
    console.log(`onClickAddNewClass: ${this.gameClasses.length}`);
  }

  async deleteClass(obj) {
    const ind = this.gameClasses.indexOf(obj);
    if (ind == -1) {
      console.log(
        `ERROR: deleteClass: ind == -1 | obj = ${JSON.stringify(obj)}`
      );
    } else {
      this.gameClasses.splice(ind, 1);
    }
  }
}

class NotificationPanel {
  // Правая нижняя панель служебных сообщений
  constructor(rootToAppend) {
    this.root = document.getElementById(rootToAppend);
    this.notifications = [];
    this.noteBlock = this.root;
  }

  alert({ msgTitle, msgText, timespan }) {
    const note = document.createElement('div');
    note.className = 'notification';
    const noteTitle = document.createElement('div'); // Заголовок
    noteTitle.className = 'not-title';
    noteTitle.innerText = msgTitle;
    const noteText = document.createElement('div'); // Текст сообщения
    noteText.className = 'not-text';
    noteText.innerText = msgText;

    note.appendChild(noteTitle);
    note.appendChild(noteText);
    this.noteBlock.appendChild(note);
    setTimeout(() => {
      setTimeout(() => {
        note.remove(); // Удалить DIV из дерева DOM
      }, 500);
      note.classList.add('hidden');
    }, timespan);
  }
}

export { GameClassPanel, NotificationPanel };

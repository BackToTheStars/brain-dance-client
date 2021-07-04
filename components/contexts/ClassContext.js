import { useEffect, createContext, useContext } from 'react';
import { useUserContext } from './UserContext';
import { useReducer } from 'reinspect';
import { getNextId } from '../classes/functions';
import {
  createClass,
  editClass,
  deleteClass,
  getClasses,
} from './api/classRequests';

const ClassContext = createContext();

export const ACTION_CLASSES_INIT = 'action-classes-init';
export const ACTION_CLASS_ADD = 'action-class-add';
export const ACTION_CLASS_UPDATE = 'action-class-update';
export const ACTION_CLASS_DELETE = 'action-class-delete';

const initialState = { classesTree: [], classesDictionary: {}, classes: [] };

// @todo: replace multiple -- with -
const getNameAlias = (title) => title.toLowerCase().replace(/\s/g, '-');

const getNewState = (state, classes) => {
  const { newClassesTree, newClassesDictionary } = getTreeDictionary(classes);
  return {
    ...state,
    classes,
    classesTree: newClassesTree,
    classesDictionary: newClassesDictionary,
  };
};

const getTreeDictionary = (classes) => {
  const newClassesDictionary = {};
  const newClassesTree = [];
  for (let classItem of classes) // классы из БД, которые не нужно менять
    newClassesDictionary[classItem.id] = { ...classItem, children: [] }; // копии добавлены в словарь

  for (let id in newClassesDictionary) {
    const classItem = newClassesDictionary[id];
    if (!!classItem.parentId) {
      newClassesDictionary[classItem.parentId].children.push(classItem); // здесь есть опасность дублирования
    } else {
      newClassesTree.push(classItem); // добавляем корневой класс, у которого могут быть children
    }
  }
  return { newClassesTree, newClassesDictionary };
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_CLASSES_INIT: {
      return getNewState(state, action.payload);
    }
    case ACTION_CLASS_ADD: {
      return getNewState(state, [...state.classes, action.payload]);
    }
    case ACTION_CLASS_UPDATE: {
      const newClasses = state.classes.map((classItem) => {
        if (classItem.id === action.payload.id) {
          let name = getNameAlias(action.payload.title);
          if (
            state.classes.find(
              (nextClassItem) =>
                nextClassItem.name === name &&
                nextClassItem.id !== action.payload.id
            )
          ) {
            name = name + `_${action.payload.id}`;
          }
          return { ...classItem, ...action.payload, name };
        } else return { ...classItem };
      });
      return getNewState(state, newClasses);
    }
    case ACTION_CLASS_DELETE: {
      // оптимизировать повторяющийся код
      const newClasses = state.classes.filter(
        (classItem) => classItem.id !== action.payload.id
      );
      return getNewState(state, newClasses);
    }
  }
};

export const ClassProvider = ({ children }) => {
  // Это другие children
  // создание компонента-обёртки

  const {
    request,
    info: { hash },
  } = useUserContext();

  const [classesState, classesDispatch] = useReducer(
    reducer,
    initialState,
    (store) => store,
    'classes'
  );

  // const [classes, setClasses] = useState([]);
  // const [classesDictionary, setClassesDictionary] = useState({}); // словарь классов для быстрого доступа
  // const [classesTree, setClassesTree] = useState([]);
  const { classes, classesDictionary, classesTree } = classesState;

  const reloadClasses = () => {
    // data fetch
    getClasses(request, hash)(
      {},
      {
        successCallback: (data) => {
          classesDispatch({ type: ACTION_CLASSES_INIT, payload: data.items });
          console.log(data);
        },
      }
    );
  };

  const getAlias = (title, nextId) => {
    let name = getNameAlias(title);
    if (classes.find((classItem) => classItem.name === name)) {
      name = name + `_${nextId}`;
    }
    return name;
  };

  const addClass = (title, parentId = null) => {
    const nextId = getNextId(classes);
    const payload = {
      id: nextId,
      title,
      parentId,
      name: getAlias(title, nextId),
    };
    classesDispatch({
      type: ACTION_CLASS_ADD,
      payload,
    });
    createClass(request, hash)(payload, {
      successCallback: (data) => {},
      errorCallback: (message) => {
        reloadClasses();
      },
    });
  };

  const updateClass = ({ id, title }) => {
    const payload = {
      id,
      title,
      name: getAlias(title, id),
    };
    classesDispatch({
      type: ACTION_CLASS_UPDATE,
      payload,
    });
    editClass(request, hash)(id, payload, {
      successCallback: (data) => {},
      errorCallback: (message) => {
        reloadClasses();
      },
    });
  };

  const removeClass = (id) => {
    classesDispatch({
      type: ACTION_CLASS_DELETE,
      payload: { id },
    });
    deleteClass(request, hash)(id, {
      successCallback: (data) => {},
      errorCallback: (message) => {
        reloadClasses();
      },
    });
  };

  useEffect(() => {
    reloadClasses();
  }, []);

  const value = {
    reloadClasses,
    classesDictionary,
    classesTree,
    classesDispatch,
    addClass,
    removeClass,
    updateClass,
    // createClass: createClass(request, hash),
    // getNextId: () => getNextId(classes),
    // getNameAlias: getNextGameAlias,
  };

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
};

export const useClassContext = () => useContext(ClassContext);

import next from 'next';
import { useState, useEffect, createContext, useContext } from 'react';
import { useUserContext } from './UserContext';
import { useReducer } from 'reinspect';
import { getNextId } from '../classes/functions';
import { createClass } from './api/classRequests';

const ClassContext = createContext();

export const ACTION_CLASSES_INIT = 'action-classes-init';
export const ACTION_CLASS_ADD = 'action-class-add';
export const ACTION_CLASS_UPDATE = 'action-class-update';
export const ACTION_CLASS_DELETE = 'action-class-delete';

const initialState = { classesTree: [], classesDictionary: {}, classes: [] };

// @todo: replace multiple -- with -
const getNameAlias = (title) => title.toLowerCase().replace(/\s/g, '-');

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
      const { newClassesTree, newClassesDictionary } = getTreeDictionary(
        action.payload
      );
      return {
        ...state,
        classes: action.payload,
        classesTree: newClassesTree,
        classesDictionary: newClassesDictionary,
      };
    }
    case ACTION_CLASS_ADD: {
      const nextId = getNextId(state.classes);
      // const { parentId } = action.payload;
      let name = getNameAlias(action.payload.title);
      if (state.classes.find((classItem) => classItem.name === name)) {
        name = name + `_${nextId}`;
      }
      const newClasses = [
        ...state.classes,
        { ...action.payload, id: nextId, name },
      ];
      const { newClassesTree, newClassesDictionary } =
        getTreeDictionary(newClasses);
      return {
        ...state,
        classes: newClasses,
        classesTree: newClassesTree,
        classesDictionary: newClassesDictionary,
      };
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
      const { newClassesTree, newClassesDictionary } =
        getTreeDictionary(newClasses);
      return {
        ...state,
        classes: newClasses,
        classesTree: newClassesTree,
        classesDictionary: newClassesDictionary,
      };
    }
    case ACTION_CLASS_DELETE: {
      // оптимизировать повторяющийся код
      const newClasses = state.classes.filter(
        (classItem) => classItem.id !== action.payload.id
      );
      const { newClassesTree, newClassesDictionary } =
        getTreeDictionary(newClasses);
      return {
        ...state,
        classes: newClasses,
        classesTree: newClassesTree,
        classesDictionary: newClassesDictionary,
      };
    }
  }
};

export const ClassProvider = ({ children }) => {
  // Это другие children
  // создание компонента-обёртки

  const { request } = useUserContext();

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

  useEffect(() => {
    const gotClasses = [
      {
        id: 1,
        title: 'Empty Class',
        name: 'empty-class',
        children: [],
      },
      {
        id: 2,
        title: 'Child Class',
        name: 'child-class',
        parentId: 1,
        children: [],
      },
    ];
    classesDispatch({ type: ACTION_CLASSES_INIT, payload: gotClasses });
  }, []);

  const value = {
    classesDictionary,
    classesTree,
    classesDispatch,
    createClass: createClass(request),
  };

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
};

export const useClassContext = () => useContext(ClassContext);

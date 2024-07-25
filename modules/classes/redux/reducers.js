import * as types from './types';

const initialClassesState = {
  classes: [],
  d: {},
  error: null,
  classesTree: [],
  maxId: 0,
};

const _getMaxId = (classes) => {
  let max = 0;
  for (const classItem of classes) {
    if (+classItem.id > max) {
      max = +classItem.id;
    }
  }
  return max;
};

const getNewClassesState = (state, classes) => {
  const { newClassesTree, newClassesDictionary } =
    getClassesTreeDictionary(classes);
  return {
    ...state,
    classes,
    classesTree: newClassesTree,
    d: newClassesDictionary,
    maxId: _getMaxId(classes),
  };
};

const getClassesTreeDictionary = (classes) => {
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

export const classesReducer = (
  state = initialClassesState,
  { type, payload }
) => {
  switch (type) {
    case types.LOAD_CLASSES:
      return {
        ...getNewClassesState(state, payload.classes),
        maxId: _getMaxId(payload.classes),
      };

    case types.CLASS_ADD: {
      const classes = [...state.classes, payload];
      return {
        ...getNewClassesState(state, classes),
        maxId: payload.id,
      };
    }
    case types.CLASS_UPDATE: {
      const classes = state.classes.map((classItem) => {
        return classItem.id !== payload.id
          ? classItem
          : { ...classItem, ...payload };
      });
      return {
        ...getNewClassesState(state, classes),
        maxId: payload.id,
      };
    }
    case types.CLASS_DELETE: {
      const newClasses = state.classes.filter(
        (classItem) => classItem.id !== payload.id
      );
      return getNewClassesState(state, newClasses);
    }
    default:
      return state; // если не нашёл никаких action
  }
};

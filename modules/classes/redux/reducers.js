import * as types from './types';

const initialClassesState = {
  classes: [],
  d: {},
  error: null,
  classesTree: [],
};

const getNewClassesState = (state, classes) => {
  const { newClassesTree, newClassesDictionary } =
    getClassesTreeDictionary(classes);
  return {
    ...state,
    classes,
    classesTree: newClassesTree,
    d: newClassesDictionary,
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
      // classes: payload.classes,
      // // формируем из классов словарь
      // d: payload.classes.reduce((a, classItem) => {
      //   a[classItem._id] = classItem; // accumulator
      //   return a;
      // }, {}),
      return getNewClassesState(state, payload.classes);
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

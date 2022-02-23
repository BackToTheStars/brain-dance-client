import * as types from './types';

const initialClassesState = {
  classes: [],
  d: {},
  error: null,
};

export const classesReducer = (
  state = initialClassesState,
  { type, payload }
) => {
  switch (type) {
    case types.LOAD_CLASSES:
      return {
        ...state,
        classes: payload.classes,
        // формируем из классов словарь
        d: payload.classes.reduce((a, classItem) => {
          a[classItem._id] = classItem; // accumulator
          return a;
        }, {}),
      };

    default:
      return state; // если не нашёл никаких action
  }
};

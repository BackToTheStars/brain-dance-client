import * as types from './types';
import {
  createClassRequest,
  deleteClass,
  getClassesRequest,
} from '../requests';

export const loadClasses = (hash) => {
  return (dispatch) => {
    getClassesRequest(hash).then((data) => {
      dispatch({ type: types.LOAD_CLASSES, payload: { classes: data.items } });
    });
  };
};

const _getAlias = (title, nextId) => {
  let name = _getNameAlias(title);
  if (classes.find((classItem) => classItem.name === name)) {
    name = name + `_${nextId}`;
  }
  return name;
};

const _getNameAlias = (title) => title.toLowerCase().replace(/\s/g, '-');

const _getNextId = (classes) => {
  let max = 1;
  for (const classItem of classes) {
    if (+classItem.id > max) {
      max = +classItem.id;
    }
  }
  return max + 1;
};

const classes = [];

export const addClass = (hash, title, parentId = null) => {
  return (dispatch) => {
    const nextId = _getNextId(classes);
    const payload = {
      id: nextId,
      title,
      parentId,
      name: _getAlias(title, nextId),
    };
    // classesDispatch({
    //   type: ACTION_CLASS_ADD,
    //   payload,
    // });
    createClassRequest(hash, payload).then((data) => {
      console.log({ data });
      // reloadClasses();
    });
  };
};

export const removeClass = (hash, id) => {
  // classesDispatch({
  //   type: ACTION_CLASS_DELETE,
  //   payload: { id },
  // });
  return (dispatch) => {
    deleteClass(hash, id).then(() => {
      dispatch({ type: types.CLASS_DELETE, payload: { id } });
    });
  };
};

// loadClasses(hash)(dispatch); вот так это работает

// const dispatch = () => {}
// applyDispatch = (callback) => {
//   return callback()(dispatch)
// }

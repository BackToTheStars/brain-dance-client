import * as types from './types';
import {
  createClassRequest,
  deleteClassRequest,
  getClassesRequest,
  updateClassRequest,
} from '../requests';

export const loadClasses = () => {
  return (dispatch) => {
    getClassesRequest().then((data) => {
      dispatch({ type: types.LOAD_CLASSES, payload: { classes: data.items } });
    });
  };
};

const _getAlias = (title, nextId) => {
  let name = _getNameAlias(title);
  name = name + `_${nextId}`;
  return name;
};

const _getNameAlias = (title) => title.toLowerCase().replace(/\s/g, '-');

export const addClass = (title, id, parentId = null) => {
  return (dispatch) => {
    const payload = {
      id,
      title,
      parentId,
      name: _getAlias(title, id),
    };

    createClassRequest(payload).then((data) => {
      dispatch({ type: types.CLASS_ADD, payload: data.item });
    });
  };
};

export const updateClass = (params) => {
  const payload = { ...params, name: _getAlias(params.title, params.id) };
  return (dispatch) => {
    updateClassRequest(payload).then(() => {
      dispatch({ type: types.CLASS_UPDATE, payload });
    });
  };
};

export const removeClass = (id) => {
  return (dispatch) => {
    deleteClassRequest(id).then(() => {
      dispatch({ type: types.CLASS_DELETE, payload: { id } });
    });
  };
};

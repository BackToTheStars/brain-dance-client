import * as types from './types';
import { getClassesRequest } from '../requests';

export const loadClasses = (hash) => {
  return (dispatch) => {
    getClassesRequest(hash).then((data) => {
      dispatch({ type: types.LOAD_CLASSES, payload: { classes: data.items } });
    });
  };
};

// loadClasses(hash)(dispatch); вот так это работает

// const dispatch = () => {}
// applyDispatch = (callback) => {
//   return callback()(dispatch)
// }

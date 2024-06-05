import {
  addCodeRequest,
  deleteGameRequest,
  editGameRequest,
} from '@/modules/admin/requests';
import * as types from './types';

export const setActiveGameByHash = (hash) => (dispatch) => {
  dispatch({
    type: types.SET_ACTIVE_GAME_BY_HASH,
    payload: hash,
  });
};

export const editGame =
  (hash, data, { onSuccess = () => {} }) =>
  (dispatch) => {
    editGameRequest(hash, data).then((responseData) => {
      dispatch({
        type: types.EDIT_GAME,
        payload: { hash, data: responseData.item },
      });
      onSuccess();
    });
  };

export const deleteGame = (hash) => (dispatch) => {
  deleteGameRequest(hash)
    .then((data) => {
      const { item, message } = data;
      if (item) {
        dispatch({
          type: types.DELETE_GAME,
          payload: hash,
        });
      } else if (message) {
        dispatch({
          type: types.DISPLAY_ERROR,
          payload: { message },
        });
      }
    })
    .catch((err) => {
      console.log(err);
      dispatch({
        type: types.DISPLAY_ERROR,
        payload: { message: err.message },
      });
    });
};

export const addCode = (hash) => (dispatch) => {
  addCodeRequest(hash).then((data) => {
    const { item, codes } = data;
    dispatch({
      type: types.SET_CODES_INFO,
      payload: {
        hash,
        code: item.hash,
        codes,
      },
    });
  });
};

export const closeError = () => (dispatch) =>
  dispatch({
    type: types.REMOVE_ERROR,
  });
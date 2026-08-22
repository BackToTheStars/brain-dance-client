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

// deleteGameRequest/addCodeRequest переведены на adminRequest: отказ приходит
// исключением, а не разрешённым промисом с { message }, поэтому разбор message
// в .then больше не нужен, а .catch обязателен — иначе необработанный reject.
export const deleteGame = (hash) => (dispatch) => {
  deleteGameRequest(hash)
    .then(() => {
      dispatch({
        type: types.DELETE_GAME,
        payload: hash,
      });
    })
    .catch((err) => {
      dispatch({
        type: types.DISPLAY_ERROR,
        payload: { message: err?.message || String(err) },
      });
    });
};

export const addCode = (hash) => (dispatch) => {
  addCodeRequest(hash)
    .then((data) => {
      const { item, codes } = data;
      dispatch({
        type: types.SET_CODES_INFO,
        payload: {
          hash,
          code: item.hash,
          codes,
        },
      });
    })
    .catch((err) => {
      dispatch({
        type: types.DISPLAY_ERROR,
        payload: { message: err?.message || String(err) },
      });
    });
};

export const closeError = () => (dispatch) =>
  dispatch({
    type: types.REMOVE_ERROR,
  });
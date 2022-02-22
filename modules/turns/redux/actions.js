import { getTurnsRequest } from '@/modules/game/requests';
import * as types from './types';

export const loadTurns = (hash) => (dispatch) => {
  getTurnsRequest(hash).then((data) => {
    dispatch({
      type: types.LOAD_TURNS,
      payload: { turns: data.items },
    });
  });
};

export const updateGeometry = (data) => (dispatch) => dispatch({
  type: types.TURNS_UPDATE_GEOMETRY,
  payload: data,
});

export const updateScrollPosition = (data) => (dispatch) => dispatch({
  type: types.TURNS_SCROLL,
  payload: data
})

export const moveField = (data) => (dispatch) => {
  return dispatch({
    type: types.TURNS_FIELD_WAS_MOVED,
    payload: data,
  });
};


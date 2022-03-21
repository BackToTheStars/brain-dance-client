import { getTurnsRequest } from '@/modules/game/requests';
import * as types from './types';
import * as gameTypes from '@/modules/game/game-redux/types';
import { createTurnRequest, updateTurnRequest } from '../requests';

export const loadTurns = (hash) => (dispatch) => {
  getTurnsRequest(hash).then((data) => {
    dispatch({
      type: types.LOAD_TURNS,
      payload: { turns: data.items },
    });
  });
};

export const updateGeometry = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_UPDATE_GEOMETRY,
    payload: data,
  });

export const updateScrollPosition = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_SCROLL,
    payload: data,
  });

export const moveField = (data) => (dispatch) => {
  dispatch({
    type: gameTypes.GAME_FIELD_MOVE,
    payload: data,
  });
  dispatch({
    type: types.TURNS_FIELD_WAS_MOVED,
    payload: data,
  });
};

export const createTurn = (turn, zeroPoint) => (dispatch) => {
  createTurnRequest(turn).then((data) => {
    const preparedTurn = {
      ...data.item,
      x: turn.x + zeroPoint.x,
      y: turn.y + zeroPoint.y,
    };
    dispatch({
      type: types.TURN_CREATE,
      payload: preparedTurn,
    });
  });
};

export const deleteTurn = (_id) => (dispatch) => {
  // updateTurnRequest(turn._id, turn).then((data) => {
  //   const preparedTurn = {
  //     ...data.item,
  //     x: turn.x + zeroPoint.x,
  //     y: turn.y + zeroPoint.y,
  //   };
  dispatch({
    type: types.TURN_DELETE,
    payload: _id,
  });
  // });
};

export const resaveTurn = (turn, zeroPoint) => (dispatch) => {
  updateTurnRequest(turn._id, turn).then((data) => {
    const preparedTurn = {
      ...data.item,
      x: turn.x + zeroPoint.x,
      y: turn.y + zeroPoint.y,
    };
    dispatch({
      type: types.TURN_RESAVE,
      payload: preparedTurn,
    });
  });
};

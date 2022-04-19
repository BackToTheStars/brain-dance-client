import { getTurnsRequest } from '@/modules/game/requests';
import * as types from './types';
import * as gameTypes from '@/modules/game/game-redux/types';
import * as quotesTypes from '@/modules/quotes/redux/types';
import {
  createTurnRequest,
  deleteTurnRequest,
  updateTurnRequest,
} from '../requests';

export const loadTurns = (hash, viewport) => (dispatch) => {
  getTurnsRequest(hash).then((data) => {
    const quotesD = {};
    for (let turn of data.items) {
      if (!turn.quotes) continue;
      for (let quote of turn.quotes) {
        quotesD[`${turn._id}_${quote.id}`] = quote;
      }
    }
    dispatch({
      type: types.LOAD_TURNS,
      payload: {
        turns: data.items.map((turn) => ({
          ...turn,
          x: turn.x - viewport.x,
          y: turn.y - viewport.y,
        })),
      },
    });
    dispatch({
      type: quotesTypes.QUOTES_SET_DICTIONARY,
      payload: quotesD,
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

export const createTurn = (turn, zeroPoint, callbacks) => (dispatch) => {
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
    callbacks?.success();
  });
};

export const deleteTurn = (_id) => (dispatch) => {
  deleteTurnRequest(_id).then((data) => {
    dispatch({
      type: types.TURN_DELETE,
      payload: _id,
    });
  });
};

export const resaveTurn = (turn, zeroPoint, callbacks) => (dispatch) => {
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
    callbacks?.success();
  });
};

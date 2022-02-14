import * as types from './types';

const initialTurnsState = {
  turns: [],
  d: {},
  error: null,
};

export const turnsReducer = (state = initialTurnsState, { type, payload }) => {
  switch (type) {
    case types.LOAD_TURNS:
      return {
        ...state,
        turns: payload.turns,
        d: payload.turns.reduce((a, turn) => {
          a[turn._id] = turn;
          return a;
        }, {})
      }
    case types.TURNS_UPDATE_GEOMETRY:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            ...payload,
          }
        }
      }
    default:
      return state;
  }
};

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
        }, {}),
      };
    case types.TURNS_UPDATE_GEOMETRY:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            ...payload,
          },
        },
      };
    case types.TURNS_SCROLL: {
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            scrollPosition: [payload.scrollPosition],
          },
        },
      };
    }
    case types.TURNS_FIELD_WAS_MOVED: {
      const { left, top } = payload;
      const newState = { ...state };
      for (let id in state.d) {
        newState.d[id] = {
          ...newState.d[id],
          x: newState.d[id].x - left,
          y: newState.d[id].y - top,
        };
      }
      return newState;
    }
    case types.TURN_RESAVE: {
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: payload,
        },
      };
    }
    default:
      return state;
  }
};

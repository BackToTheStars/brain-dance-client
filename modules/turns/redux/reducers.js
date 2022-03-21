import turnSettings from '../settings';
import * as types from './types';

const initialTurnsState = {
  turns: [],
  d: {},
  error: null,
  zeroPointId: null,
};

export const turnsReducer = (state = initialTurnsState, { type, payload }) => {
  switch (type) {
    case types.LOAD_TURNS:
      return {
        ...state,
        turns: payload.turns,
        zeroPointId: payload.turns.find(
          (turn) => turn.contentType === turnSettings.TEMPLATE_ZERO_POINT
        )._id,
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

    case types.TURN_CREATE: {
      return {
        ...state,
        turns: [...state.turns, payload],
        d: {
          ...state.d,
          [payload._id]: payload,
        },
      };
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

    case types.TURN_DELETE: {
      // в payload прилетит _id
      const preparedD = { ...state.d };
      delete preparedD[payload];

      return {
        ...state,
        turns: state.turns.filter((turn) => turn._id !== payload),
        d: preparedD,
      };
    }

    default:
      return state;
  }
};

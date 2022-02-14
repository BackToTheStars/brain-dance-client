import * as types from './types';

const initialGameState = {
  game: [],
  error: null,
};

export const gameReducer = (state = initialGameState, { type, payload }) => {
  switch (type) {
    case types.LOAD_GAME:
      return {
        ...state,
        game: payload
      }
    default:
      return state;
  }
};

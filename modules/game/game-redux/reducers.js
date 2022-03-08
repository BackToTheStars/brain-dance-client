import * as types from './types';

const initialGameState = {
  game: null,
  position: { left: 0, top: 0 },
  error: null,
};

export const gameReducer = (state = initialGameState, { type, payload }) => {
  switch (type) {
    case types.LOAD_GAME:
      return {
        ...state,
        game: payload,
        position: {
          left: payload.viewportPointX,
          top: payload.viewportPointY,
        }
      }
    case types.GAME_FIELD_MOVE:
      return {
        ...state,
        position: {
          left: state.position.left + payload.left,
          top: state.position.top + payload.top,
        }
      }
    default:
      return state;
  }
};

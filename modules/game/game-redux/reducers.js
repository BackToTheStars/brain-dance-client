import * as types from './types';

const initialGameState = {
  game: null,
  position: { left: 0, top: 0 },
  error: null,
  editMode: false,
  cancelCallback: () => {},
};

export const gameReducer = (state = initialGameState, { type, payload }) => {
  switch (type) {
    case types.LOAD_GAME:
      return {
        ...state,
        game: payload,
        position: payload.position,
      };
    case types.GAME_FIELD_MOVE:{
      return {
        ...state,
        position: {
          x: state.position.x + payload.left,
          y: state.position.y + payload.top,
        },
      };
    }

    case types.GAME_EDIT_MODE_SWITCH:
      return {
        ...state,
        editMode: payload,
      };

    case types.GAME_CREATE_CANCEL_CALLBACK:
      return {
        ...state,
        cancelCallback: payload,
      };

    default:
      return state;
  }
};

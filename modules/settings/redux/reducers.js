import * as types from './types';

const initialState = {
  games: [],
};

export const settingsReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.SETTINGS_GAMES_LOAD: {
      return {
        ...state,
        games: payload,
      };
    }
    case types.SETTINGS_GAME_ADD: {
      return {
        ...state,
        games: [...state.games, payload],
      };
    }
    case types.SETTINGS_GAME_UPDATE: {
      return {
        ...state,
        games: state.games.map((g) =>
          g.hash === payload.hash ? payload.game : g
        ),
      };
    }
    default: {
      return state;
    }
  }
};

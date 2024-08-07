import { lsUpdateGames } from './requests';
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
    case types.SETTINGS_GAME_DELETE: {
      return {
        ...state,
        games: state.games.filter((g) => g.hash !== payload),
      };
    }
    case types.SETTINGS_GAME_UPDATE: {
      const updatedGames = state.games.map((g) =>
        g.hash === payload.hash ? payload.game : g,
      );
      lsUpdateGames(updatedGames);
      return {
        ...state,
        games: updatedGames,
      };
    }
    default: {
      return state;
    }
  }
};

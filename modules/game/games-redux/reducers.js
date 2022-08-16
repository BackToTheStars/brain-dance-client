import * as types from './types';

const initialGamesState = {
  games: [],
  activeGame: null,
  error: null,
  lastTurns: [],
  lastTurnsGamesDictionary: [],
};

export const gamesReducer = (state = initialGamesState, { type, payload }) => {
  switch (type) {
    case types.LOAD_GAMES:
      const activeGame = payload.games?.length
        ? payload.games[payload.activeIndex || 0]
        : null;
      return {
        ...state,
        games: payload.games,
        activeGame,
      };
    case types.SET_ACTIVE_GAME_BY_HASH:
      return {
        ...state,
        activeGame: state.games.find((game) => game.hash === payload),
      };
    case types.EDIT_GAME: {
      const { hash, data } = payload;
      return {
        ...state,
        games: state.games.map((game) => {
          return game.hash === hash
            ? {
                ...game,
                ...data,
              }
            : game;
        }),
        activeGame:
          state.activeGame?.hash === hash
            ? {
                ...state.activeGame,
                ...data,
              }
            : state.activeGame,
      };
    }
    case types.DELETE_GAME: {
      const hash = payload;
      return {
        ...state,
        games: state.games.filter((game) => game.hash !== hash),
        activeGame:
          state.activeGame.hash === hash
            ? state.games[0].hash === hash
              ? state.games[1]
              : state.games[0]
            : state.activeGame,
      };
    }
    case types.SET_CODES_INFO: {
      const { hash, code, codes } = payload;
      return {
        ...state,
        games: state.games.map((game) => {
          return game.hash === hash
            ? {
                ...game,
                code,
                codes,
              }
            : game;
        }),
        activeGame:
          state.activeGame?.hash === hash
            ? {
                ...state.activeGame,
                code,
                codes,
              }
            : state.activeGame,
      };
    }
    case types.DISPLAY_ERROR: {
      const { message } = payload;
      return {
        ...state,
        error: message,
      };
    }
    case types.REMOVE_ERROR: {
      return {
        ...state,
        error: null,
      };
    }
    case types.GAMES_SET_LAST_TURNS: {
      return {
        ...state,
        lastTurns: payload.turns,
        lastTurnsGamesDictionary: payload.lastTurnsGamesDictionary,
      };
    }
    default:
      return state;
  }
};

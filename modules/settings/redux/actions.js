import { getStore, lsUpdateGames } from './requests';
import * as types from './types';

export const loadSettings = () => (dispatch) => {
  const ls = getStore();
  dispatch({
    type: types.SETTINGS_GAMES_LOAD,
    payload: ls.games,
  });
};

export const addGame =
  ({ hash, nickname, role, code }) =>
  (dispatch, getState) => {
    const games = getState().settings.games;
    const currentGame = games.find((g) => g.hash === hash);
    if (currentGame) {
      console.log({ currentGame });
      const currentCode = currentGame.codes.find((c) => c.code === code);
      let updatedGame;
      if (currentCode) {
        updatedGame = {
          ...currentGame,
          codes: currentGame.codes.map((c) => {
            if (c.code === code) {
              return { nickname, role, code };
            }
            return c;
          }),
        };
      } else {
        updatedGame = {
          ...currentGame,
          codes: [...currentGame.codes, { nickname, role, code }],
        };
      }

      const newGames = games.map((g) => (g.hash === hash ? updatedGame : g));
      lsUpdateGames(newGames);
      dispatch({
        type: types.SETTINGS_GAME_UPDATE,
        payload: {
          hash,
          game: updatedGame,
        },
      });
    } else {
      const newGames = [
        ...games,
        {
          hash,
          codes: [{ nickname, role, code }],
        },
      ];
      lsUpdateGames(newGames);
      dispatch({
        type: types.SETTINGS_GAME_ADD,
        payload: {
          hash,
          codes: [{ nickname, role, code }],
        },
      });
    }
  };

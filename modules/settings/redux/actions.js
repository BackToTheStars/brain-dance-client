import {
  getStore,
  lsUpdateGames,
  lsUpdateLayoutSettings,
  lsUpdateTextSettings,
} from './requests';
import * as types from './types';
import * as lobbyTypes from '@/modules/lobby/redux/types';

export const loadSettings = () => (dispatch) => {
  const ls = getStore();
  dispatch({
    type: types.SETTINGS_GAMES_LOAD,
    payload: ls.games,
  });
};

export const addGameCode =
  ({ hash, nickname, role, code }) =>
  (dispatch, getState) => {
    const games = getState().settings.games;
    const currentGame = games.find((g) => g.hash === hash);
    if (currentGame) {
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
      lsUpdateGames(newGames); // @todo: move to reducer
      dispatch({
        type: types.SETTINGS_GAME_ADD,
        payload: {
          hash,
          codes: [{ nickname, role, code }],
        },
      });
    }
  };

export const removeGameCode =
  ({ hash, code }) =>
  (dispatch, getState) => {
    const games = getState().settings.games;
    const currentGame = games.find((g) => g.hash === hash);
    const updatedCodes = currentGame.codes.filter((c) => c.code !== code);
    if (updatedCodes.length === 0) {
      dispatch(removeGameFromList(hash));
    } else {
      dispatch({
        type: types.SETTINGS_GAME_UPDATE,
        payload: {
          hash,
          game: {
            ...currentGame,
            codes: updatedCodes,
          },
        },
      });
    }
  };

export const removeGameFromList = (hash) => (dispatch) => {
  const games = getStore().games;
  const newGames = games.filter((g) => g.hash !== hash);
  lsUpdateGames(newGames);
  dispatch({
    type: types.SETTINGS_GAME_DELETE,
    payload: hash,
  });
};

export const updateActiveCode =
  (hash, code, active) => (dispatch, getState) => {
    const games = getState().settings.games;
    const currentGame = games.find((g) => g.hash === hash);
    const updatedCodes = currentGame.codes.map((c) =>
      c.code === code ? { ...c, active } : { ...c, active: false },
    );
    dispatch({
      type: types.SETTINGS_GAME_UPDATE,
      payload: {
        hash,
        game: {
          ...currentGame,
          codes: updatedCodes,
        },
      },
    });
  };

export const pinFirstCode = (hash) => (dispatch) => {
  const games = getStore().games;
  const currentGame = games.find((g) => g.hash === hash);
  const updatedCodes = currentGame.codes.map((c, i) =>
    i === 0 ? { ...c, active: true } : { ...c, active: false },
  );
  dispatch({
    type: types.SETTINGS_GAME_UPDATE,
    payload: {
      hash,
      game: {
        ...currentGame,
        codes: updatedCodes,
      },
    },
  });
};

export const unpinAllCodes = (hash) => (dispatch) => {
  const games = getStore().games;
  const currentGame = games.find((g) => g.hash === hash);
  const updatedCodes = currentGame.codes.map((c) => ({ ...c, active: false }));
  dispatch({
    type: types.SETTINGS_GAME_UPDATE,
    payload: {
      hash,
      game: {
        ...currentGame,
        codes: updatedCodes,
      },
    },
  });
};

export const loadStore = (store) => (dispatch) => {
  const { games, layoutSettings, textSettings } = store;
  if (games && games.length) {
    lsUpdateGames(games);
    dispatch({
      type: types.SETTINGS_GAMES_LOAD,
      payload: getStore().games,
    });
  }

  if (layoutSettings && Object.keys(layoutSettings).length) {
    // @todo: move to redux from context
    // lsUpdateLayoutSettings(layoutSettings);
    // ???
  }

  if (textSettings && Object.keys(textSettings).length) {
    lsUpdateTextSettings(textSettings);
    dispatch({
      type: lobbyTypes.LOBBY_TEXT_SETTINGS_LOAD,
      payload: textSettings,
    });
  }
};

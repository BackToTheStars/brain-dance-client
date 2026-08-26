import { addGameCode } from '@/modules/settings/redux/actions';
import {
  loadGamesRequest,
  loadTurnsByGameRequest,
  loadTurnsChronoRequest,
} from './requests';
import * as types from './types';
// import { loadTurnsRequest } from './requests';
import { openModal } from '@/modules/ui/redux/actions';
import { MODAL_CONFIRM } from '@/config/lobby/modal';
import { setGameInfoIntoStorage } from '@/modules/user/contexts/UserContext';
import { getGameUserTokenRequest } from '@/modules/game/requests';

export const loadTextSettings = (settings) => (dispatch) => {
  dispatch({
    type: types.LOBBY_TEXT_SETTINGS_LOAD,
    payload: settings,
  });
};

export const changeTextSettings = (field, value) => (dispatch) => {
  dispatch({
    type: types.LOBBY_TEXT_SETTINGS_SET,
    payload: { field, value },
  });
};

export const changeRequestSettings = (field, value) => (dispatch) => {
  dispatch({
    type: types.LOBBY_REQUEST_SETTINGS_SET,
    payload: { field, value },
  });
}

export const changeLayoutSettings = (field, value) => (dispatch) => {
  dispatch({
    type: types.LOBBY_LAYOUT_SETTINGS_SET,
    payload: { field, value },
  });
};

export const closeModal = () => (dispatch) => {
  dispatch({
    type: types.LOBBY_MODAL_SET,
    payload: { open: false, type: null, params: {} },
  });
};

export const toggleSliderModal = (type, params) => (dispatch, getState) => {
  const prevModal = getState().lobby.sliderModal;
  const areEqual =
    prevModal.type === type &&
    JSON.stringify(prevModal.params) === JSON.stringify(params);
  dispatch({
    type: types.LOBBY_SLIDER_MODAL_SET,
    payload: { open: !areEqual || !prevModal.open, type, params },
  });
};

export const closeSliderModal =
  (removeContentDelay = 0) =>
  (dispatch, getState) => {
    if (removeContentDelay) {
      const prevModal = getState().lobby.sliderModal;
      dispatch({
        type: types.LOBBY_SLIDER_MODAL_SET,
        payload: {
          ...prevModal,
          open: false,
        },
      });
      setTimeout(() => {
        dispatch({
          type: types.LOBBY_SLIDER_MODAL_SET,
          payload: { open: false, type: null, params: {} },
        });
      }, removeContentDelay);
    } else {
      dispatch({
        type: types.LOBBY_SLIDER_MODAL_SET,
        payload: { open: false, type: null, params: {} },
      });
    }
  };

export const switchTheme = () => (dispatch, getState) => {
  const html = document.querySelector('html');
  const theme = getState().lobby.textSettings.theme;
  localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');

  if (html) {
    html.classList.remove(theme);
    html.classList.add(localStorage.getItem('theme'));
  }

  dispatch({
    type: types.LOBBY_THEME,
    payload: theme === 'light' ? 'dark' : 'light',
  });
};

// текст отказа для панели: сообщение сервера, иначе — причина сбоя запроса
const getRequestErrorText = (error) => error?.message || 'Неизвестная ошибка';

export const loadGames = () => (dispatch) => {
  dispatch({ type: types.LOBBY_GAMES_REQUEST });
  return loadGamesRequest()
    .then((data) => {
      const dictionaryGames = data.items.reduce((acc, obj) => {
        return {
          ...acc,
          [obj._id]: obj,
        };
      }, {});
      dispatch({
        type: types.LOBBY_GAMES_LOAD,
        payload: { items: data.items, d: dictionaryGames },
      });
    })
    .catch((error) => {
      dispatch({
        type: types.LOBBY_GAMES_ERROR,
        payload: getRequestErrorText(error),
      });
    });
};
export const loadTurns = () => (dispatch, getState) => {
  const mode = getState().lobby.mode;
  const requestSettings = getState().lobby.requestSettings;
  const loadTurnsRequest =
    mode === 'byGame' ? loadTurnsByGameRequest : loadTurnsChronoRequest;
  dispatch({ type: types.LOBBY_TURNS_REQUEST });
  return loadTurnsRequest(requestSettings)
    .then((data) => {
      dispatch({
        type: types.LOBBY_TURNS_LOAD,
        payload: data.items,
      });
    })
    .catch((error) => {
      dispatch({
        type: types.LOBBY_TURNS_ERROR,
        payload: getRequestErrorText(error),
      });
    });
};

export const switchMode = (mode) => (dispatch) => {
  dispatch({ type: types.LOBBY_MODE_SET, payload: mode });
};

const sidebarObj = {};
export const toggleSidebar = (sidebar) => (dispatch, getState) => {
  const state = getState();
  sidebarObj[sidebar] =
    sidebar in state.lobby.sidebar ? !state.lobby.sidebar[sidebar] : true;
  return dispatch({
    type: types.LOBBY_SIDEBAR,
    payload: { ...sidebarObj },
  });
};

export const lobbyEnterGameWithConfirm =
  (code, nickname, focusTurnId = null) =>
  (dispatch) => {
  return new Promise((resolve, reject) => {
    getGameUserTokenRequest(code, nickname).then((data) => {
      if (data.success) {
        resolve();
        const { info, token } = data;
        const { hash, nickname, role, code } = info;
        dispatch(addGameCode({ hash, nickname, role, code }));
        dispatch(
          openModal(MODAL_CONFIRM, {
            text: 'Go_to_the_game',
            callback: () => {
              setGameInfoIntoStorage(hash, {
                info,
                token,
              });
              // не терять ход из расшаренной ссылки (?turn=)
              location.replace(
                `/game?hash=${hash}${focusTurnId ? `&turn=${focusTurnId}` : ''}`,
              );
            },
          }),
        );
      } else {
        reject(data?.message || 'Неизвестная ошибка');
      }
    });
  });
};

// вход по коду из handoff-ссылки лобби: ник уже спросили диалогом, подтверждать
// нечего — сохраняем доступ и уходим на хеш игры, где ждёт обычный pre-game диалог
export const lobbyEnterGameByCode =
  (code, nickname, focusTurnId = null) =>
  (dispatch) => {
  return new Promise((resolve, reject) => {
    getGameUserTokenRequest(code, nickname).then((data) => {
      if (data?.success) {
        const { info, token } = data;
        dispatch(
          addGameCode({
            hash: info.hash,
            nickname: info.nickname,
            role: info.role,
            code: info.code,
          }),
        );
        setGameInfoIntoStorage(info.hash, { info, token });
        resolve(data);
        location.replace(
          `/game?hash=${info.hash}${focusTurnId ? `&turn=${focusTurnId}` : ''}`,
        );
      } else {
        reject(data?.message || 'Неизвестная ошибка');
      }
    });
  });
};

export const lobbyEnterGameForRequest = (hash, code, nickname) => (dispatch) => {
  return new Promise((resolve, reject) => {
    getGameUserTokenRequest(code, nickname).then((data) => {
      if (data.success) {
        const { info, token } = data;
        setGameInfoIntoStorage(hash, {
          info,
          token,
        });
        resolve(data);
      } else {
        reject(data?.message || 'Неизвестная ошибка');
      }
    });
  });
};
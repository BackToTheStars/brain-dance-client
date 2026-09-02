import { s } from '@/config/request';
import { API_URL } from '@/config/server';
import { removeGameInfo } from '@/modules/user/contexts/UserContext';

export const settings = { token: null };
export const setUserToken = (nextToken) => (settings.token = nextToken);

// Диалог входа в игру: там пользователь заново вводит код.
const GAME_DIALOG_PATH = '/game';
// Уводим в диалог один раз за загрузку страницы: холст шлёт много запросов,
// и каждый из них получил бы тот же отказ.
let leavingToDialog = false;

// Сервер отвечает 401 на запрос с game-token ровно в одном случае: токен
// подделан или испорчен. Протухший токен ошибкой не считается (пускают
// посетителем, клиент обновляет его сам), нехватка прав — это 403, а вход по
// коду идёт мимо этой функции. Значит, сохранённый доступ негоден: снимаем
// его и уводим в диалог входа — иначе запись остаётся в хранилище и каждое
// открытие холста повторяет alert, из которого нет выхода.
// Возвращает true, если отказ обработан переходом и сообщение показывать не надо.
const dropBrokenAccess = (hash) => {
  if (typeof window === 'undefined') return false;
  // Переход уже начат — молчим: остальные запросы холста получили тот же отказ,
  // а location.pathname к этому моменту успевает смениться на адрес диалога.
  if (leavingToDialog) return true;
  removeGameInfo(hash);
  // Запрос уже со страницы диалога: уводить некуда, показываем сообщение.
  if (window.location.pathname === GAME_DIALOG_PATH) return false;
  leavingToDialog = true;
  window.location.assign(`${GAME_DIALOG_PATH}?hash=${hash}`);
  return true;
};

export const request = async (
  path,
  { body = null, tokenFlag = false, method = 'GET' } = {},
  { errorMessage, errorCallback, successCallback } = {},
) => {
  let defaultMessage = errorMessage || `Произошла ошибка, метод ${method}`;
  const params = {
    method,
    headers: {
      'content-type': 'application/json',
    },
  };
  // Токен подмешиваем, только если он есть: заголовок из null/undefined
  // превращается в строку «null»/«undefined», и сервер принимает её за
  // испорченный токен — отсюда 401 при первом открытии игры без входа.
  const withToken = Boolean(tokenFlag && s.token);
  if (withToken) {
    params.headers['game-token'] = s.token;
  }
  if (body) {
    params.body = JSON.stringify(body);
  }

  const hash = s.hash;

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/${path}`, params)
      .then((response) => {
        return response.json().then((res) => ({ response, res }));
      })
      .then(({ response, res }) => {
        const { message = defaultMessage, item, items, success } = res;
        // @todo: более гибкая обработка
        if (item || items || success) {
          resolve(res);
          if (successCallback) {
            successCallback(res);
          }
        } else if (
          withToken &&
          response.status === 401 &&
          dropBrokenAccess(hash)
        ) {
          // доступ снят, пользователь уходит в диалог входа — без alert
        } else {
          if (errorCallback) {
            errorCallback(message);
          } else {
            alert(message);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        reject('Request error');
      });
  });
};

export const getGameRequest = (hash) => {
  return request(`game?hash=${s.hash}`, {
    tokenFlag: true,
  });
};

export const updateGameRequest = (data) => {
  return request(`game?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'PUT',
    body: data,
  });
}

export const deleteGameRequest = () => {
  return request(`game?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'DELETE',
  });
};

export const addCodeRequest = (body) => {
  return request(`codes/add?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'POST',
    body,
  });
};

export const refreshTokenRequest = (hash, token, nickname) => {
  return fetch(`${API_URL}/codes/refresh?hash=${hash}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'game-token': token,
    },
    body: JSON.stringify({
      nickname,
    }),
  }).then((res) => res.json());
};

// PUBLIC REQUESTS
export const createGameRequest = (name, gameIsPublic) => {
  // добавить description, players
  return fetch(`${API_URL}/game`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name,
      public: gameIsPublic,
    }),
  }).then((res) => res.json());
};

export const getGameUserTokenRequest = (code, nickname) => {
  return fetch(`${API_URL}/codes/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      nickname,
    }),
  }).then((res) => res.json());
};

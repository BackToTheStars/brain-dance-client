import { s } from '@/config/request';
import { API_URL } from '@/config/server';

export const settings = { token: null };
export const setUserToken = (nextToken) => (settings.token = nextToken);

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
  if (tokenFlag) {
    params.headers['game-token'] = s.token;
  }
  if (body) {
    params.body = JSON.stringify(body);
  }

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/${path}`, params)
      .then((data) => {
        return data.json();
      })
      .then((res) => {
        const { message = defaultMessage, item, items, success } = res;
        // @todo: более гибкая обработка
        if (item || items || success) {
          resolve(res);
          if (successCallback) {
            successCallback(res);
          }
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

export const saveGamePositionRequest = (gamePosition) => {
  return request(`codes/viewport?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'PUT',
    body: gamePosition,
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

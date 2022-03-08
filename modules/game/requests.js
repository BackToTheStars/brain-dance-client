import { s } from '@/config/request';
import { API_URL } from '@/config/server';

export const settings = { token: null };
export const setUserToken = (nextToken) => (settings.token = nextToken);

export const request = async (
  path,
  { body = null, tokenFlag = false, method = 'GET' } = {},
  { errorMessage, errorCallback, successCallback } = {}
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
        const { message = defaultMessage, item, items } = res;
        // @todo: более гибкая обработка
        if (item || items) {
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

export const getTurnsRequest = (hash) => {
  return request(`turns?hash=${s.hash}`, {
    tokenFlag: true,
  });
};

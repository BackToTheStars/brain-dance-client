import { API_URL } from '@/config/server';
import { settings } from '@/modules/game/requests';
export const setUserToken = (nextToken) => (token = nextToken);

const request = async (
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
    params.headers['game-token'] = settings.token;
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

export const createClassRequest = (hash, body) =>
  request(`classes?hash=${hash}`, {
    method: 'POST',
    tokenFlag: true,
    body: body,
  });

export const deleteClassRequest = (hash, classItemId) => {
  return request(`classes/${classItemId}?hash=${hash}`, {
    method: 'DELETE',
    tokenFlag: true,
  });
};

export const updateClassRequest = (hash, params) =>
  request(`classes/${params.id}?hash=${hash}`, {
    method: 'PUT',
    tokenFlag: true,
    body: params,
  });

export const getClassesRequest = (hash) => {
  return request(`classes?hash=${hash}`);
};

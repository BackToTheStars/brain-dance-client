import { API_URL } from '@/config/server';
let token;
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
    params.headers['game-token'] = token;
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

export const createClass =
  (
    request, // можно добавить (request, обработчикОшибок) - это замыкание, closure
    hash
  ) =>
  (body, callbacks = {}) => {
    request(
      `classes?hash=${hash}`,
      {
        method: 'POST',
        tokenFlag: true,
        body: body,
      },
      {
        successCallback: (data) => {
          if (callbacks.successCallback) {
            callbacks.successCallback(data);
          }
        },
        ...callbacks,
      }
    );
  };

export const editClass =
  (request, hash) =>
  (id, body, callbacks = {}) => {
    request(
      `classes/${id}?hash=${hash}`,
      {
        method: 'PUT',
        tokenFlag: true,
        body: body,
      },
      {
        successCallback: (data) => {
          if (callbacks.successCallback) {
            callbacks.successCallback(data);
          }
        },
        ...callbacks,
      }
    );
  };

export const deleteClass =
  (request, hash) =>
  (id, callbacks = {}) => {
    request(
      `classes/${id}?hash=${hash}`,
      {
        method: 'DELETE',
        tokenFlag: true,
      },
      {
        successCallback: (data) => {
          if (callbacks.successCallback) {
            callbacks.successCallback(data);
          }
        },
        ...callbacks,
      }
    );
  };

export const getClassesRequest = (hash) => {
  return request(`classes?hash=${hash}`);
};

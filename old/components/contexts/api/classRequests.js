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

export const getClasses =
  (request, hash) =>
  (body, callbacks = {}) => {
    request(
      `classes?hash=${hash}`,
      {
        method: 'GET',
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

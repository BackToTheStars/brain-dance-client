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

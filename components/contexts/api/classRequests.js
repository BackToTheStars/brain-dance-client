export const createClass =
  (
    request // можно добавить (request, обработчикОшибок) - это замыкание, closure
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

import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const getTurnsGeometryRequest = (hash) => {
  return request(`turns/geometry?hash=${s.hash}`, {
    tokenFlag: true,
  });
};

export const getTurnsByIdsRequest = (ids, options) => {
  return request(
    `turns/ids?hash=${s.hash}&ids=${ids.join(',')}`,
    {
      tokenFlag: true,
    },
    options,
  );
};

export const createTurnRequest = (body) => {
  return request(`turns/?hash=${s.hash}`, {
    method: 'POST',
    tokenFlag: true,
    body: body,
  });
};

export const updateTurnRequest = (id, body, options) => {
  return request(
    `turns/${id}?hash=${s.hash}`,
    {
      method: 'PUT',
      tokenFlag: true,
      body: body,
    },
    options,
  );
};

// Операции над частью хода (ряды перевода, поля); ответ { success, version } без самого хода.
export const turnOpsRequest = (id, ops, options) => {
  return request(
    `turns/${id}/ops?hash=${s.hash}`,
    {
      method: 'POST',
      tokenFlag: true,
      body: { ops },
    },
    options,
  );
};

export const deleteTurnRequest = (id) => {
  return request(`turns/${id}?hash=${s.hash}`, {
    method: 'DELETE',
    tokenFlag: true,
  });
};

export const updateCoordinatesRequest = (changedTurns, options) => {
  if (!changedTurns.length) return Promise.resolve();
  return request(
    `turns/coordinates?hash=${s.hash}`,
    {
      tokenFlag: true,
      method: 'PUT',
      body: {
        turns: changedTurns,
      },
    },
    options,
  );
};

export const updateScrollPositionsRequest = (scrollPositions, options) => {
  return request(
    `turns/scroll-positions?hash=${s.hash}`,
    {
      tokenFlag: true,
      method: 'PUT',
      body: {
        turns: scrollPositions,
      },
    },
    options,
  );
};

// options прокидываются в request() — вызывающему может понадобиться errorCallback:
// без него request() при ошибке сервера показывает alert и не завершает промис.
export const getTokenRequest = (action, options) => {
  return request(
    `codes/static-token?hash=${s.hash}`,
    {
      tokenFlag: true,
      method: 'POST',
      body: {
        action: action,
      },
    },
    options,
  );
};

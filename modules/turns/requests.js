import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const getTurnsGeometryRequest = (hash) => {
  return request(`turns/geometry?hash=${s.hash}`, {
    tokenFlag: true,
  });
};

export const getTurnsByIdsRequest = (ids) => {
  return request(`turns/ids?hash=${s.hash}&ids=${ids.join(',')}`, {
    tokenFlag: true,
  });
};

export const createTurnRequest = (body) => {
  return request(`turns/?hash=${s.hash}`, {
    method: 'POST',
    tokenFlag: true,
    body: body,
  });
};

export const updateTurnRequest = (id, body) => {
  return request(`turns/${id}?hash=${s.hash}`, {
    method: 'PUT',
    tokenFlag: true,
    body: body,
  });
};

export const deleteTurnRequest = (id) => {
  return request(`turns/${id}?hash=${s.hash}`, {
    method: 'DELETE',
    tokenFlag: true,
  });
};

export const updateCoordinatesRequest = (changedTurns) => {
  if (!changedTurns.length) return Promise.resolve();
  return request(`turns/coordinates?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'PUT',
    body: {
      turns: changedTurns,
    },
  });
};

export const updateScrollPositionsRequest = (scrollPositions) => {
  return request(`turns/scroll-positions?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'PUT',
    body: {
      turns: scrollPositions,
    },
  });
};

export const getTokenRequest = (action) => {
  return request(`codes/static-token?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'POST',
    body: {
      action: action,
    },
  });
};

import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const getTurnsByIdsRequest = (ids) => {
  return request(`new-turns/ids?hash=${s.hash}&ids=${ids.join(',')}`, {
    tokenFlag: true,
  });
}

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
  return request(`turns/coordinates?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'PUT',
    body: {
      turns: changedTurns,
    },
  });
};

export const getTokenRequest = (action) => {
  return request(`games/tokens?hash=${s.hash}`, {
    tokenFlag: true,
    method: 'POST',
    body: {
      action: action,
    },
  });
};

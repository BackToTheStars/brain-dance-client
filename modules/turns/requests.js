import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const updateTurnRequest = (id, body) => {
  return request(`turns/${id}?hash=${s.hash}`, {
    method: 'PUT',
    tokenFlag: true,
    body: body,
  });
};

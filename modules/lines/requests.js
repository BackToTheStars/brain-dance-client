import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const createLinesRequest = (linesArray) =>
  request(`lines?hash=${s.hash}`, {
    method: 'POST',
    tokenFlag: true,
    body: linesArray,
  });

export const deleteLinesRequest = (ids) => {
  return request(`lines/?hash=${s.hash}`, {
    method: 'DELETE',
    tokenFlag: true,
    body: ids,
  });
};

export const getLinesRequest = () => {
  return request(`lines?hash=${s.hash}`);
};

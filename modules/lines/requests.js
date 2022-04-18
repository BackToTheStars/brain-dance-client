import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const createLinesRequest = (linesArray) =>
  request(`lines?hash=${s.hash}`, {
    method: 'POST',
    tokenFlag: true,
    body: linesArray,
  });

export const deleteLineRequest = (lineItemId) => {
  return request(`lines/${lineItemId}?hash=${s.hash}`, {
    method: 'DELETE',
    tokenFlag: true,
  });
};

// export const updateLineRequest = (params) =>
//   request(`lines/${params.id}?hash=${s.hash}`, {
//     method: 'PUT',
//     tokenFlag: true,
//     body: params,
//   });

export const getLinesRequest = () => {
  return request(`lines?hash=${s.hash}`);
};

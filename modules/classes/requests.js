import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const setUserToken = (nextToken) => (token = nextToken);

export const createClassRequest = (hash, body) =>
  request(`classes?hash=${s.hash}`, {
    method: 'POST',
    tokenFlag: true,
    body: body,
  });

export const deleteClassRequest = (hash, classItemId) => {
  return request(`classes/${classItemId}?hash=${s.hash}`, {
    method: 'DELETE',
    tokenFlag: true,
  });
};

export const updateClassRequest = (hash, params) =>
  request(`classes/${params.id}?hash=${s.hash}`, {
    method: 'PUT',
    tokenFlag: true,
    body: params,
  });

export const getClassesRequest = (hash) => {
  return request(`classes?hash=${s.hash}`);
};

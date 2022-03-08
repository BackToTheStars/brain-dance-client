import { s } from '@/config/request';
import { request } from '@/modules/game/requests';

export const setUserToken = (nextToken) => (token = nextToken);

export const createClassRequest = (body) =>
  request(`classes?hash=${s.hash}`, {
    method: 'POST',
    tokenFlag: true,
    body: body,
  });

export const deleteClassRequest = (classItemId) => {
  return request(`classes/${classItemId}?hash=${s.hash}`, {
    method: 'DELETE',
    tokenFlag: true,
  });
};

export const updateClassRequest = (params) =>
  request(`classes/${params.id}?hash=${s.hash}`, {
    method: 'PUT',
    tokenFlag: true,
    body: params,
  });

export const getClassesRequest = () => {
  return request(`classes?hash=${s.hash}`);
};

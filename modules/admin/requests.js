import { API_URL } from '@/config/server';

let adminToken;
export const setAdminToken = (nextAdminToken) => (adminToken = nextAdminToken);

// ADMIN REQUESTS WITH TOKEN
export const getGamesRequest = () => {
  return fetch(`${API_URL}/games`, {
    headers: {
      authorization: `Bearer ${adminToken}`,
    },
  }).then((res) => res.json());
};

export const editGameRequest = (hash, data) => {
  return fetch(`${API_URL}/game?hash=${hash}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()); // вернёт Promise
};

export const deleteGameRequest = (hash) => {
  return fetch(`${API_URL}/game?hash=${hash}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
  }).then((res) => res.json()); // вернёт Promise
};

export const addCodeRequest = (hash) => {
  return fetch(`${API_URL}/codes?hash=${hash}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
  }).then((res) => res.json()); // вернёт Promise
};

// PUBLIC REQUESTS
export const createGameRequest = (name, gameIsPublic) => {
  // добавить description, players
  return fetch(`${API_URL}/games`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name,
      public: gameIsPublic,
    }),
  }).then((res) => res.json());
};

export const loginRequest = ({ nickname, password }) => {
  return fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      nickname,
      password,
    }),
  }).then((res) => res.json());
};

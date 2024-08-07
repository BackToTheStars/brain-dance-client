import { API_URL } from '@/config/server';

let adminToken;
export const setAdminToken = (nextAdminToken) => (adminToken = nextAdminToken);

export const loginRequest = ({ nickname, password }) => {
  return fetch(`${API_URL}/admin/auth/login`, {
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

// ADMIN REQUESTS WITH TOKEN
export const getAdminScriptsRequest = () => {
  return fetch(`${API_URL}/admin/scripts`, {
    headers: {
      authorization: `Bearer ${adminToken}`,
    },
  }).then((res) => res.json());
}

export const runAdminScriptRequest = (scriptName, commandName) => {
  return fetch(`${API_URL}/admin/scripts`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ scriptName, commandName }),
  }).then((res) => res.json());
}

export const getAdminGamesRequest = () => {
  return fetch(`${API_URL}/admin/games`, {
    headers: {
      authorization: `Bearer ${adminToken}`,
    },
  }).then((res) => res.json());
};

export const deleteAdminGameRequest = (id) => {
  return fetch(`${API_URL}/admin/games/${id}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
  }).then((res) => res.json()); // вернёт Promise
};

export const getAdminTurnsRequest = ({ gameId = null } = {}) => {
  let url = `${API_URL}/admin/turns`;
  const params = {};

  if (gameId) {
    params.gameId = gameId;
  }

  if (Object.keys(params).length) {
    url += `?${new URLSearchParams(params).toString()}`;
  }
  return fetch(url, {
    headers: {
      authorization: `Bearer ${adminToken}`,
    },
  }).then((res) => res.json());
};

// @deprecated
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

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

// Общий helper для админских ручек. Соседние функции ниже отдают `res.json()` как есть,
// а `fetch` не считает 4xx/5xx отказом — поэтому 400/404/413/502/504 приходят в компонент
// неотличимо от успеха (конверт у ошибки другой: `{ message }` вместо `{ item }`).
// Здесь отказ поднимается исключением с текстом от сервера, чтобы вызывающий показал его
// пользователю. Таймаута нет намеренно: перенос YouTube-видео идёт минутами.
const adminRequest = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${adminToken}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Ошибка запроса (${res.status})`);
  }
  return data;
};

// ADMIN REQUESTS WITH TOKEN
export const getAdminScriptsRequest = () => {
  return fetch(`${API_URL}/admin/scripts`, {
    headers: {
      authorization: `Bearer ${adminToken}`,
    },
  }).then((res) => res.json());
}

export const runAdminScriptRequest = (scriptName, commandName, params = {}) => {
  return fetch(`${API_URL}/admin/scripts`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ scriptName, commandName, params }),
  }).then((res) => res.json());
}

export const getAdminGamesRequest = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/admin/games${query ? `?${query}` : ''}`, {
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

// Статистика хранилища media (прокси server → media). Ответ тяжёлый: разбивка по типам
// считается агрегацией по всем файлам, поэтому запрос идёт только по кнопке, без автообновления.
export const getAdminMediaStatsRequest = () => {
  return fetch(`${API_URL}/admin/media/stats`, {
    headers: {
      authorization: `Bearer ${adminToken}`,
    },
  }).then((res) => res.json());
};

export const getAdminLogsRequest = () => {
  return fetch(`${API_URL}/admin/logs`, {
    headers: {
      authorization: `Bearer ${adminToken}`,
    },
  }).then((res) => res.json());
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

export const getAdminTurnRequest = (id) => adminRequest(`/admin/turns/${id}`);

// Перенос всех «чужих» медиа хода одним вызовом (пять полей сразу, поэтому кнопка одна
// на ход, а не на поле). Ответ — { item: { turn, results } }, results разбирает UI.
export const relocateTurnMediaRequest = (turnId) =>
  adminRequest('/admin/turns/relocate-media', {
    method: 'POST',
    body: { turnId },
  });

// Варианты YouTube-ролика: { item: { title, duration, formats } }.
export const probeTurnYoutubeRequest = (turnId) =>
  adminRequest('/admin/turns/youtube/probe', {
    method: 'POST',
    body: { turnId },
  });

// Перенос выбранного варианта: конверт тот же, что у relocate-media. Идёт минутами —
// вызывающий обязан заблокировать повторный запуск.
export const relocateTurnYoutubeRequest = (turnId, formatId) =>
  adminRequest('/admin/turns/youtube/relocate', {
    method: 'POST',
    body: { turnId, formatId },
  });

// @deprecated — заменён на relocateTurnMediaRequest; сам эндпоинт снимается отдельной
// задачей, поэтому функция пока остаётся, но из клиента не вызывается.
export const moveAudioRequest = (data) => {
  return fetch(`${API_URL}/admin/turns/move-audio`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
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

export const getTgChatIdsRequest = () => {
  return fetch(`${API_URL}/admin/tg-logs/chat-ids`, {
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
};

export const getTgLogsRequest = (chatId, filter = {}) => {
  let url = `${API_URL}/admin/tg-logs`;

  if (chatId) {
    url += `?chatId=${chatId}`;
  }
  if (Object.keys(filter).length) {
    url += `&${new URLSearchParams(filter).toString()}`;
  }
  return fetch(url, {
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
    },
  }).then((res) => res.json());
};
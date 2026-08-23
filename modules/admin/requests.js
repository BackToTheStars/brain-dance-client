import { API_URL } from '@/config/server';

let adminToken;
export const setAdminToken = (nextAdminToken) => (adminToken = nextAdminToken);

// Общий helper для админских ручек — через него идут все запросы этого файла.
// `fetch` не считает 4xx/5xx отказом, поэтому голый `res.json()` отдавал
// 400/404/413/502/504 в компонент неотличимо от успеха
// (конверт у ошибки другой: `{ message }` вместо `{ item }`). Здесь отказ поднимается
// исключением с текстом от сервера, чтобы вызывающий показал его пользователю —
// значит у каждого вызова обязан быть свой обработчик отказа.
// Таймаута нет намеренно: перенос YouTube-видео идёт минутами.
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

// Вход в админку. Ручка /admin/auth смонтирована ДО adminMiddleware (server.js),
// поэтому уходящий заголовок `Bearer undefined` она не смотрит. Успех —
// { success, expires, token }, отказ (401) — исключение с текстом сервера:
// раньше 401 приходил разрешённым промисом, и в localStorage уезжал undefined.
export const loginRequest = ({ nickname, password }) =>
  adminRequest('/admin/auth/login', {
    method: 'POST',
    body: { nickname, password },
  });

// ADMIN REQUESTS WITH TOKEN
export const getAdminScriptsRequest = () => adminRequest('/admin/scripts');

export const runAdminScriptRequest = (scriptName, commandName, params = {}) =>
  adminRequest('/admin/scripts', {
    method: 'POST',
    body: { scriptName, commandName, params },
  });

export const getAdminGamesRequest = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return adminRequest(`/admin/games${query ? `?${query}` : ''}`);
};

export const deleteAdminGameRequest = (id) =>
  adminRequest(`/admin/games/${id}`, { method: 'DELETE' });

// Статистика хранилища media (прокси server → media). Ответ тяжёлый: разбивка по типам
// считается агрегацией по всем файлам, поэтому запрос идёт только по кнопке, без автообновления.
export const getAdminMediaStatsRequest = () => adminRequest('/admin/media/stats');

export const getAdminLogsRequest = () => adminRequest('/admin/logs');

export const getAdminTurnsRequest = ({ gameId = null } = {}) => {
  const params = {};

  if (gameId) {
    params.gameId = gameId;
  }

  const query = new URLSearchParams(params).toString();
  return adminRequest(`/admin/turns${query ? `?${query}` : ''}`);
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

export const deleteGameRequest = (hash) =>
  adminRequest(`/game?hash=${hash}`, { method: 'DELETE' });

export const addCodeRequest = (hash) =>
  adminRequest(`/codes?hash=${hash}`, { method: 'POST' });

export const getTgChatIdsRequest = () => adminRequest('/admin/tg-logs/chat-ids');

// Строка запроса собирается целиком, а не склейкой: раньше при пустом chatId
// фильтр приписывался через `&` без предшествующего `?` — URL получался битым.
export const getTgLogsRequest = (chatId, filter = {}) => {
  const query = new URLSearchParams({
    ...(chatId ? { chatId } : {}),
    ...filter,
  }).toString();
  return adminRequest(`/admin/tg-logs${query ? `?${query}` : ''}`);
};
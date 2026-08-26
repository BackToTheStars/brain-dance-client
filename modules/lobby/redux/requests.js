import { LOBBY_API_URL } from '@/config/server';
import { getCodesString } from '@/modules/settings/redux/requests';

// Отказ /lobby/* раньше не отличался от успеха: разбирали res.json() и сразу
// лезли в data.items. Здесь отказ становится reject с внятным текстом, а вызов
// в actions переводит его в состояние ошибки панели.
const lobbyRequest = (url, options) => {
  return fetch(url, options).then((res) => {
    return res
      .json()
      .catch(() => null) // 500 и прокси отвечают не JSON
      .then((data) => {
        if (!res.ok || !data || !data.items) {
          throw new Error(
            data?.message || `${res.status} ${res.statusText || ''}`.trim(),
          );
        }
        return data;
      });
  });
};

export const loadTurnsRequest = () => {
  return fetch(`${LOBBY_API_URL}/turns?hash=373`).then((res) => res.json());
};

export const loadTurnsByGameRequest = ({ gameLimit, turnLimit }) => {
  const codeStr = getCodesString();
  let url = `${LOBBY_API_URL}/lobby/turns?mode=byGame&codes=${codeStr}`;
  url += `&gameLimit=${gameLimit}&turnLimit=${turnLimit}`;
  return lobbyRequest(url);
};

export const loadTurnsChronoRequest = ({ pinned }) => {
  const codeStr = getCodesString(pinned);
  let url = `${LOBBY_API_URL}/lobby/turns?mode=chrono&codes=${codeStr}`
  if (pinned) {
    url += '&chosen=1';
  }
  return lobbyRequest(url);
};

export const loadGamesRequest = () => {
  const codeStr = getCodesString();
  return lobbyRequest(`${LOBBY_API_URL}/lobby/games?codes=${codeStr}`);
};

export const loadGamesByHashesRequest = (hashes) => {
  return fetch(
    `${LOBBY_API_URL}/lobby/games-by-hashes?hashes=${hashes.join(',')}`,
  ).then((res) => res.json());
};

export const checkGameRequest = (hash, token) => {
  return fetch(`${LOBBY_API_URL}/lobby/check-game?hash=${hash}`, {
    headers: {
      'game-token': token,
    },
  }).then((res) => res.json());
};

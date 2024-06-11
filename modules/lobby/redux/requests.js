import { LOBBY_API_URL } from "@/config/server";
import { getCodesString } from "@/modules/settings/redux/requests";

export const loadTurnsRequest = () => {
  return fetch(`${LOBBY_API_URL}/turns?hash=373`).then(
    (res) => res.json()
  );
};

export const loadTurnsByGameRequest = () => {
  const codeStr = getCodesString();
  return fetch(`${LOBBY_API_URL}/lobby/turns?mode=byGame&gameLimit=25&turnLimit=3&codes=${codeStr}`).then(
    (res) => res.json()
  );
};

export const loadTurnsChronoRequest = () => {
  const codeStr = getCodesString();
  return fetch(`${LOBBY_API_URL}/lobby/turns?mode=chrono&codes=${codeStr}`).then(
    (res) => res.json()
  );
};

export const loadGamesRequest = () => {
  const codeStr = getCodesString();
  return fetch(`${LOBBY_API_URL}/lobby/games?codes=${codeStr}`).then(
    (res) => res.json()
  );
}

export const loadGamesByHashesRequest = (hashes) => {
  return fetch(`${LOBBY_API_URL}/lobby/games-by-hashes?hashes=${hashes.join(",")}`).then(
    (res) => res.json()
  );
}

export const checkGameRequest = (hash, token) => {
  return fetch(`${LOBBY_API_URL}/lobby/check-game?hash=${hash}`, {
    headers: {
      'game-token': token,
    },
  }).then((res) => res.json());
}
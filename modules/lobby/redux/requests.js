import { LOBBY_API_URL } from "@/config/server";

export const loadTurnsRequest = () => {
  return fetch(`${LOBBY_API_URL}/turns?hash=373`).then(
    (res) => res.json()
  );
};

export const loadTurnsByGameRequest = () => {
  return fetch(`${LOBBY_API_URL}/lobby/turns?mode=byGame&gameLimit=25&turnLimit=3`).then(
    (res) => res.json()
  );
};

export const loadTurnsChronoRequest = () => {
  return fetch(`${LOBBY_API_URL}/lobby/turns?mode=chrono`).then(
    (res) => res.json()
  );
};
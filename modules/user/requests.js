import { API_URL } from '@/config/server';

// PUBLIC REQUESTS
export const getGameUserTokenRequest = (hash, nickname) => {
  return fetch(`${API_URL}/codes/login/${hash}?nickname=${nickname}`).then(
    (res) => res.json()
  );
};
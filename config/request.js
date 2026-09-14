export const s = {
  hash: null,
  token: null
}

export const setRequestSettings = (hash, token) => {
  s.hash = hash
  s.token = token
}

export const ERROR_GAME_NOT_FOUND = 'game-not-found'
export const ERROR_TOKEN_EXPIRED = 'token-expired'
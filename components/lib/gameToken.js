const GAME_KEY_PREFIX = 'game_';

const getGameInfo = (hash) => {
  if (typeof window === 'undefined') {
    return null; // get guest info
  }

  return JSON.parse(localStorage.getItem(`${GAME_KEY_PREFIX}${hash}`));
};

const setGameInfo = (hash, info) => {
  // info (hash, nickname, role)
  // token
  localStorage.setItem(`${GAME_KEY_PREFIX}${hash}`, JSON.stringify(info));
};

module.exports = {
  getGameInfo,
  setGameInfo,
};

import { getGameInfo } from '../../src/lib/gameToken';

const guestUser = {
  info: {
    nickname: 'Guest',
    role: 1, // @todo: use client constants
  },
};

const useUser = (hash) => {
  // info (hash, nickname, role)
  // token
  guestUser.hash = hash;
  const { info, token } = getGameInfo(hash) || guestUser;

  return {
    info,
  };
};

export default useUser;

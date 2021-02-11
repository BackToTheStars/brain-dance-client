import { getGameInfo } from '../../src/lib/gameToken';
import { checkRuleByRole } from '../config';

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

  const can = function (rule) {
    return checkRuleByRole(rule, info.role);
  };

  return {
    info,
    can,
  };
};

export default useUser;

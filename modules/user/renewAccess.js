import { s, setRequestSettings } from '@/config/request';
import { refreshTokenRequest } from '@/modules/game/requests';
import {
  getGameInfo,
  saveGameInfo,
} from '@/modules/user/contexts/UserContext';
import { isRenewalDue } from './token';

export const RENEW_NOT_DUE = 'not-due';
export const RENEW_DONE = 'renewed';
export const RENEW_EXPIRED = 'expired';
export const RENEW_REFUSED = 'refused';
// No verdict on the token (network, server error): the access stays as it is.
export const RENEW_OFFLINE = 'offline';

const pending = new Map();

export const renewAccessIfDue = (hash) => {
  const token = getGameInfo(hash)?.token;
  if (!token || !isRenewalDue(token)) return Promise.resolve(RENEW_NOT_DUE);
  if (!pending.has(token)) {
    const renewal = refreshTokenRequest(hash, token)
      .then(
        (data) => {
          // A newer login replaced the token meanwhile: this answer is about the old one.
          if (getGameInfo(hash)?.token !== token) return RENEW_NOT_DUE;
          if (data.success) {
            saveGameInfo(hash, { info: data.info, token: data.token });
            if (s.hash === hash) setRequestSettings(hash, data.token);
            return RENEW_DONE;
          }
          return data.expired ? RENEW_EXPIRED : RENEW_REFUSED;
        },
        () => RENEW_OFFLINE,
      )
      .finally(() => pending.delete(token));
    pending.set(token, renewal);
  }
  return pending.get(token);
};

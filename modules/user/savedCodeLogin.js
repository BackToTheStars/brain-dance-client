import { enterGameByCode } from '@/modules/lobby/redux/actions';
import { isRenewalDue } from './token';

// Log in with the saved code once the stored token is past half of its lifetime: an
// expired token cannot be renewed. null — the token is good or there is nothing to log in with.
export const savedCodeLoginParams = (record, saved, now = Date.now()) => {
  if (!saved?.code) return null;
  if (record?.token && !isRenewalDue(record.token, now)) return null;
  const nickname = record?.info?.nickname || saved.nickname;
  return nickname ? { code: saved.code, nickname } : null;
};

// Resolves with the login answer, or null when no login is due; rejects when it failed.
export const loginWithSavedCode = (record, saved) => (dispatch) => {
  const params = savedCodeLoginParams(record, saved);
  if (!params) return Promise.resolve(null);
  return enterGameByCode(params.code, params.nickname)(dispatch);
};

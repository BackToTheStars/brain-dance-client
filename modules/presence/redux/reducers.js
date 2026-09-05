import { STATUS_OFF, STATUS_ONLINE } from '@/config/presence';
import * as types from './types';

// Who is online in the current game. `members` is always the full snapshot the
// server sent last (no deltas), `sid` is this tab's own id in that list, and
// `error` is a text for the panel: a rejected command or the reason the
// connection stopped. Nothing here is persisted — online is off on every load.
const initialPresenceState = {
  status: STATUS_OFF,
  sid: null,
  members: [],
  error: null,
};

export const presenceReducer = (
  state = initialPresenceState,
  { type, payload },
) => {
  switch (type) {
    case types.PRESENCE_STATUS_SET:
      return {
        ...state,
        status: payload.status,
        error: payload.error ?? null,
      };

    case types.PRESENCE_WELCOME:
      return {
        ...state,
        status: STATUS_ONLINE,
        sid: payload.sid,
        members: payload.members,
        error: null,
      };

    case types.PRESENCE_MEMBERS_SET:
      return {
        ...state,
        members: payload.members,
      };

    case types.PRESENCE_ERROR_SET:
      return {
        ...state,
        error: payload.error,
      };

    case types.PRESENCE_RESET:
      return initialPresenceState;

    default:
      return state;
  }
};

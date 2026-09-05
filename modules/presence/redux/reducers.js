import { STATUS_OFF, STATUS_ONLINE } from '@/config/presence';
import * as types from './types';

// Who is online in the current game. `members` is always the full snapshot the
// server sent last (no deltas), `sid` is this tab's own id in that list, and
// `error` is a text for the panel: a rejected command or the reason the
// connection stopped. `cursor` is where the guide of the tour I follow last
// moved their mouse (canvas coordinates), `cursorSharing` is my own "Show my
// cursor" switch — the server knows nothing about it — and `tourEnded` says
// that the tour I followed is over. Nothing here is persisted — online is off
// on every load.
const initialPresenceState = {
  status: STATUS_OFF,
  sid: null,
  members: [],
  error: null,
  cursor: null,
  cursorSharing: false,
  tourEnded: false,
};

const meIn = (members, sid) =>
  sid ? members.find((member) => member.sid === sid) || null : null;

// The marker belongs to the guide of the tour I follow: no tour, another
// guide's frame or a guide who has left the list — no marker.
const cursorAfterSnapshot = (cursor, members, following) => {
  if (!cursor || !following) return null;
  const guide = members.find((member) => member.sid === cursor.from);
  return guide && guide.tour === following ? cursor : null;
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
      // A fresh connection: the marker of the previous one means nothing, the
      // "Tour ended" notice survives — a reconnect is not my action.
      return {
        ...state,
        status: STATUS_ONLINE,
        sid: payload.sid,
        members: payload.members,
        error: null,
        cursor: null,
      };

    case types.PRESENCE_MEMBERS_SET: {
      const { members } = payload;
      const wasFollowing = meIn(state.members, state.sid)?.following || null;
      const following = meIn(members, state.sid)?.following || null;
      return {
        ...state,
        members,
        // My subscription dropped without me asking: the guide ended the tour
        // or never came back from a break.
        tourEnded: state.tourEnded || (!!wasFollowing && !following),
        cursor: cursorAfterSnapshot(state.cursor, members, following),
      };
    }

    case types.PRESENCE_CURSOR_SET:
      return {
        ...state,
        cursor: payload.cursor,
      };

    case types.PRESENCE_CURSOR_SHARING_SET:
      return {
        ...state,
        cursorSharing: payload.on,
      };

    case types.PRESENCE_TOUR_ENDED_SET:
      return {
        ...state,
        tourEnded: payload.tourEnded,
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

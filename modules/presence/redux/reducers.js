import { STATUS_OFF, STATUS_ONLINE } from '@/config/presence';
import * as types from './types';

// Who is online in the current game. `members` is always the full snapshot the
// server sent last (no deltas), `sid` is this tab's own id in that list, and
// `error` is a text for the panel: a rejected command or the reason the
// connection stopped. `cursor` is where the guide of the tour I follow last
// moved their mouse (canvas coordinates), `cursorSharing` is my own "Show my
// cursor" switch — the server knows nothing about it — and `tourEnded` says
// that the tour I followed is over. `strokes` are the pencil marks over the
// canvas (canvas coordinates, mine when I guide, the guide's when I follow),
// `pencil` and `eraser` are my own switches, like `cursorSharing`. Nothing here
// is persisted — online is off on every load, and marks live only while the
// tour does.
const initialPresenceState = {
  status: STATUS_OFF,
  sid: null,
  members: [],
  error: null,
  cursor: null,
  cursorSharing: false,
  tourEnded: false,
  strokes: {},
  pencil: false,
  eraser: false,
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

// Marks belong to a tour, so a snapshot decides their fate: my own stay while I
// draw them, a guide's stay while I follow that guide and they are in the list.
// The tour ended, the guide left for a break, I unsubscribed or moved to
// another tour — the canvas is clean again.
const strokesAfterSnapshot = (strokes, members, following, sid) => {
  const ids = Object.keys(strokes);
  if (!ids.length) return strokes;
  const guideSid = following
    ? members.find((member) => member.tour === following)?.sid || null
    : null;
  const kept = {};
  ids.forEach((id) => {
    const { from } = strokes[id];
    if ((sid && from === sid) || (guideSid && from === guideSid))
      kept[id] = strokes[id];
  });
  return Object.keys(kept).length === ids.length ? strokes : kept;
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
      // "Tour ended" notice survives — a reconnect is not my action. The marks
      // go too: a guide coming back after a break finds a clean canvas, which
      // is what the followers saw the moment the guide dropped out.
      return {
        ...state,
        status: STATUS_ONLINE,
        sid: payload.sid,
        members: payload.members,
        error: null,
        cursor: null,
        strokes: {},
        pencil: false,
        eraser: false,
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
        strokes: strokesAfterSnapshot(
          state.strokes,
          members,
          following,
          state.sid,
        ),
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

    case types.PRESENCE_PENCIL_SET:
      return {
        ...state,
        pencil: payload.on,
        // The eraser is a mode of the pencil and goes off with it.
        eraser: payload.on ? state.eraser : false,
      };

    case types.PRESENCE_ERASER_SET:
      return {
        ...state,
        eraser: payload.on,
      };

    case types.PRESENCE_STROKE_START:
      return {
        ...state,
        strokes: {
          ...state.strokes,
          [payload.id]: { from: payload.from, points: [...payload.points] },
        },
      };

    case types.PRESENCE_STROKE_POINTS: {
      // A portion for a stroke this tab never saw open (joined the tour in the
      // middle of it) starts the stroke instead of being thrown away.
      const stroke = state.strokes[payload.id];
      return {
        ...state,
        strokes: {
          ...state.strokes,
          [payload.id]: stroke
            ? { ...stroke, points: [...stroke.points, ...payload.points] }
            : { from: payload.from, points: [...payload.points] },
        },
      };
    }

    case types.PRESENCE_STROKE_REMOVE: {
      if (!state.strokes[payload.id]) return state;
      const strokes = { ...state.strokes };
      delete strokes[payload.id];
      return { ...state, strokes };
    }

    case types.PRESENCE_STROKES_CLEAR: {
      // `from` names whose marks go; without it the canvas is cleared whole.
      const { from = null } = payload || {};
      if (!from) return { ...state, strokes: {} };
      const strokes = {};
      Object.keys(state.strokes).forEach((id) => {
        if (state.strokes[id].from !== from) strokes[id] = state.strokes[id];
      });
      return { ...state, strokes };
    }

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

// The presence connection: one native WebSocket per tab, kept outside Redux the
// way config/request.js keeps the request settings. Redux only ever sees the
// results (status, members, errors) through `dispatch`; the panel and the
// thunks in redux/actions.js drive it through connect / disconnect / send.
//
// Protocol and close codes: brain-platform/docs/presence.md.

import { API_URL } from '@/config/server';
import {
  CAST_CURSOR,
  CAST_DRAW,
  CAST_SAVED,
  CAST_VIEWPORT,
  CAST_VIEWPORT_REPORT,
  CLOSE_AMBIGUOUS,
  CLOSE_BAD_MESSAGE,
  CLOSE_FULL,
  CLOSE_GAME_NOT_FOUND,
  CLOSE_NORMAL,
  CLOSE_TOKEN,
  DRAW_CLEAR,
  DRAW_MOVE,
  DRAW_REMOVE,
  DRAW_START,
  ERROR_NO_LEADER,
  FULL_RETRY_MS,
  MSG_CAST,
  MSG_ERROR,
  MSG_FOLLOW,
  MSG_HELLO,
  MSG_LEAD,
  MSG_MEMBERS,
  MSG_WELCOME,
  RECONNECT_BASE_MS,
  RECONNECT_JITTER,
  RECONNECT_MAX_MS,
  STATUS_CONNECTING,
  STATUS_ERROR,
  STATUS_RECONNECTING,
  TOUR_PARAM,
  WS_PATH,
} from '@/config/presence';
import { centerViewportAtPosition } from '@/modules/game/game-redux/actions';
import { dropBrokenAccess, refreshTokenRequest } from '@/modules/game/requests';
import {
  getGameInfo,
  setGameInfoIntoStorage,
} from '@/modules/user/contexts/UserContext';
import { stopDrawing } from './draw';
import { refreshAfterSave } from './redux/refresh';
import * as types from './redux/types';

const conn = {
  ws: null,
  hash: null,
  dispatch: null,
  reloadUserInfo: null,
  // The user wants to be online. False stops every retry: a close event on a
  // socket nobody wants any more is ignored.
  wanted: false,
  // Sockets opened since connect(): the first attempt is "connecting", every
  // later one is "reconnecting".
  opened: 0,
  // Failed attempts since the last welcome — drives the backoff.
  attempt: 0,
  timer: null,
  // My own id in the last snapshot.
  sid: null,
  // The id of the tour I am guiding, learned from the last snapshot. It
  // outlives the connection on purpose: after a reconnect the client asks for
  // that very tour back, and its followers stay with it.
  tour: null,
  // The tour I follow, so that a reconnect restores the subscription; the id is
  // stable now, unlike the guide's sid in the first version of the protocol.
  followWanted: null,
  // The tour from an invite link: joined once, right after the first welcome.
  joinTour: null,
  // The sid of the guide of the tour I follow — whose cursor frames to accept.
  guideSid: null,
  // The sids of the followers of the tour I guide — whose viewport reports to
  // accept.
  followers: new Set(),
  // A follow this client sent on its own (from a link or restoring a
  // subscription): a "no such tour" answer to it is the "Tour ended" notice,
  // not a command the user has to be told about.
  autoFollow: false,
  // One token refresh per rejected token; a second rejection drops the access.
  tokenRefreshed: false,
  listening: false,
};

const socketUrl = () => `${API_URL.replace(/^http/, 'ws')}${WS_PATH}`;

// The invite link has done its job once the subscription is sent: the address
// bar goes back to the plain canvas so that a reload (or a copied address) does
// not try to join the tour a second time. Same trick as the one that drops the
// shared turn from the address, but a function of its own — that one belongs to
// saving the field.
const dropTourFromUrl = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(TOUR_PARAM)) return;
  url.searchParams.delete(TOUR_PARAM);
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
};

// What the connection has to remember from a snapshot to survive a reconnect:
// my tour, my subscription and the guide whose cursor frames I accept. Taken
// from `members` only — the `welcome` list is the state before this connection
// said anything, and reading it would erase what has to be restored.
const syncFromMembers = (members) => {
  const me = members.find((member) => member.sid === conn.sid) || null;
  conn.tour = me?.tour || null;
  conn.followWanted = me?.following || null;
  conn.guideSid = conn.followWanted
    ? members.find((member) => member.tour === conn.followWanted)?.sid || null
    : null;
  conn.followers = new Set(
    conn.tour
      ? members
          .filter((member) => member.following === conn.tour)
          .map((member) => member.sid)
      : [],
  );
  // The subscription this connection asked for on its own went through; a
  // refusal that arrives later is about something else.
  if (conn.followWanted) conn.autoFollow = false;
};

const setStatus = (status, error = null) =>
  conn.dispatch({ type: types.PRESENCE_STATUS_SET, payload: { status, error } });

const clearTimer = () => {
  if (conn.timer) {
    clearTimeout(conn.timer);
    conn.timer = null;
  }
};

const isOpen = () => !!conn.ws && conn.ws.readyState === WebSocket.OPEN;
const isConnecting = () =>
  !!conn.ws && conn.ws.readyState === WebSocket.CONNECTING;

const backoffDelay = () => {
  const base = Math.min(
    RECONNECT_BASE_MS * 2 ** Math.max(conn.attempt - 1, 0),
    RECONNECT_MAX_MS,
  );
  const jitter = base * RECONNECT_JITTER * (Math.random() * 2 - 1);
  return Math.round(base + jitter);
};

const scheduleReconnect = (delay) => {
  clearTimer();
  conn.timer = setTimeout(() => {
    conn.timer = null;
    open();
  }, delay);
};

// A browser script may close with 1000 or 3000–4999 only; anything else
// (1001 "going away" included) throws. For those the frame goes without a
// code — the server sees 1005 — the meaning (the tab is leaving) is the same.
const closeSocket = (code) => {
  const ws = conn.ws;
  if (!ws) return;
  conn.ws = null;
  ws.onopen = null;
  ws.onmessage = null;
  ws.onclose = null;
  ws.onerror = null;
  try {
    if (code === CLOSE_NORMAL || (code >= 3000 && code <= 4999)) {
      ws.close(code);
    } else {
      ws.close();
    }
  } catch (err) {
    // already closing or closed
  }
};

// The stored token is forged, broken or issued for another game, and the
// refresh did not help: the same exit as a 401 on an HTTP request — the access
// record is removed and the page goes to the entry dialog.
const giveUpAccess = () => {
  const { hash, dispatch } = conn;
  disconnect(CLOSE_NORMAL);
  dispatch({ type: types.PRESENCE_RESET });
  dropBrokenAccess(hash);
};

const refreshAccessAndRetry = () => {
  const { token, info } = getGameInfo(conn.hash) || {};
  if (!token || conn.tokenRefreshed) {
    giveUpAccess();
    return;
  }
  conn.tokenRefreshed = true;
  refreshTokenRequest(conn.hash, token, info?.nickname)
    .then((data) => {
      if (!conn.wanted) return;
      if (!data?.success || !data.token) {
        giveUpAccess();
        return;
      }
      setGameInfoIntoStorage(conn.hash, { info: data.info, token: data.token });
      if (conn.reloadUserInfo) conn.reloadUserInfo();
      open();
    })
    .catch(() => {
      if (conn.wanted) giveUpAccess();
    });
};

const closeTexts = {
  [CLOSE_BAD_MESSAGE]: 'Protocol error: the server rejected a message',
  [CLOSE_GAME_NOT_FOUND]: 'Game not found',
  [CLOSE_AMBIGUOUS]: 'The game address matches more than one game',
};

const handleClose = (ws, event) => {
  if (conn.ws !== ws) return; // a socket we have already let go of
  conn.ws = null;
  if (!conn.wanted) return;

  const { code, reason } = event;
  if (code in closeTexts) {
    // Nothing a retry could fix: stop and show why.
    conn.wanted = false;
    removeListeners();
    setStatus(STATUS_ERROR, reason ? `${closeTexts[code]} (${reason})` : closeTexts[code]);
    return;
  }
  if (code === CLOSE_TOKEN) {
    setStatus(STATUS_RECONNECTING, 'Access token rejected, refreshing it');
    refreshAccessAndRetry();
    return;
  }
  if (code === CLOSE_FULL) {
    setStatus(STATUS_RECONNECTING, 'The game is full, retrying in a minute');
    scheduleReconnect(FULL_RETRY_MS);
    return;
  }
  // 1006 and the rest: a dropped connection, the server restarting (1012),
  // a hello that did not make it in time (4408) — back off and retry.
  conn.attempt += 1;
  setStatus(STATUS_RECONNECTING);
  scheduleReconnect(backoffDelay());
};

// The tour this connection has to ask for again after a reconnect: the one the
// invite link named, otherwise the one I was following.
const restoreTour = () => {
  if (conn.joinTour) {
    const tour = conn.joinTour;
    conn.joinTour = null;
    dropTourFromUrl();
    return tour;
  }
  return conn.followWanted;
};

const handleWelcome = (msg) => {
  conn.attempt = 0;
  conn.tokenRefreshed = false;
  conn.sid = msg.sid;
  // A connection starts with a clean canvas: the pencil is off and the marks
  // are gone (the slice does that on welcome). A guide coming back from a break
  // sees what the followers have been seeing all along — nothing.
  stopDrawing();
  conn.dispatch({
    type: types.PRESENCE_WELCOME,
    payload: { sid: msg.sid, members: msg.members || [] },
  });
  // A guide takes their tour back by its id: the followers are still on it,
  // waiting out the break. A new connection with no tour behind it just asks
  // to follow again — the id is stable, so this works now.
  if (conn.tour) {
    send({ t: MSG_LEAD, on: true, tour: conn.tour });
    conn.joinTour = null;
    dropTourFromUrl();
    return;
  }
  const tour = restoreTour();
  if (!tour) return;
  conn.autoFollow = true;
  send({ t: MSG_FOLLOW, tour });
};

// A frame of the guide's pencil. The server keeps nothing and sends nothing on
// its own, so a portion of points for a stroke this tab never saw open (joined
// the tour in the middle of it, a frame the rate limit dropped) opens the
// stroke instead of being lost. `end` needs nothing: the stroke is already on
// the canvas.
const handleDrawCast = (msg) => {
  const { op, id, from } = msg;
  const hasId = typeof id === 'string' && !!id;
  if (
    op === DRAW_START &&
    hasId &&
    Number.isFinite(msg.x) &&
    Number.isFinite(msg.y)
  ) {
    conn.dispatch({
      type: types.PRESENCE_STROKE_START,
      payload: { id, from, points: [msg.x, msg.y] },
    });
    return;
  }
  if (op === DRAW_MOVE && hasId && Array.isArray(msg.points)) {
    const { points } = msg;
    if (points.length < 2 || points.length % 2) return;
    if (!points.every((value) => Number.isFinite(value))) return;
    conn.dispatch({
      type: types.PRESENCE_STROKE_POINTS,
      payload: { id, from, points },
    });
    return;
  }
  if (op === DRAW_REMOVE && hasId) {
    conn.dispatch({ type: types.PRESENCE_STROKE_REMOVE, payload: { id } });
    return;
  }
  if (op === DRAW_CLEAR) {
    conn.dispatch({ type: types.PRESENCE_STROKES_CLEAR, payload: { from } });
  }
};

const handleCast = (msg) => {
  if (
    msg.kind === CAST_VIEWPORT &&
    Number.isFinite(msg.x) &&
    Number.isFinite(msg.y)
  ) {
    conn.dispatch(centerViewportAtPosition({ x: msg.x, y: msg.y }));
    return;
  }
  if (msg.kind === CAST_CURSOR) {
    // Only my own guide draws on my canvas.
    if (!conn.guideSid || msg.from !== conn.guideSid) return;
    const cursor =
      msg.off === true || !Number.isFinite(msg.x) || !Number.isFinite(msg.y)
        ? null
        : { from: msg.from, x: msg.x, y: msg.y };
    conn.dispatch({ type: types.PRESENCE_CURSOR_SET, payload: { cursor } });
    return;
  }
  if (msg.kind === CAST_DRAW) {
    // Only my own guide draws on my canvas.
    if (!conn.guideSid || msg.from !== conn.guideSid) return;
    handleDrawCast(msg);
    return;
  }
  if (msg.kind === CAST_VIEWPORT_REPORT) {
    // The rectangle a follower sees — only while I guide, and only from
    // someone on my tour (the server routes it to me, but the snapshot is
    // the judge of who is on the tour right now).
    if (!conn.tour || !conn.followers.has(msg.from)) return;
    const { from, x, y, width, height } = msg;
    if (![x, y, width, height].every(Number.isFinite)) return;
    if (width <= 0 || height <= 0) return;
    conn.dispatch({
      type: types.PRESENCE_VIEWPORT_REPORTED,
      payload: { from, x, y, width, height },
    });
    return;
  }
  if (msg.kind === CAST_SAVED) {
    // My own guide saved the field: fetch what was saved, the canvas stays put.
    if (!conn.guideSid || msg.from !== conn.guideSid) return;
    conn.dispatch(refreshAfterSave());
    return;
  }
  console.warn('presence: unsupported cast', msg.kind);
};

const handleError = (msg) => {
  // The tour from the link (or the one I was following) is gone: that is a
  // state of the tour block, not a failed command of mine.
  if (msg.code === ERROR_NO_LEADER && conn.autoFollow) {
    conn.autoFollow = false;
    conn.followWanted = null;
    conn.guideSid = null;
    conn.dispatch({
      type: types.PRESENCE_TOUR_ENDED_SET,
      payload: { tourEnded: true },
    });
    return;
  }
  // A rejected command — the connection lives, the panel shows the text.
  conn.dispatch({
    type: types.PRESENCE_ERROR_SET,
    payload: {
      error: msg.message || `Command rejected (${msg.code || 'unknown'})`,
    },
  });
};

const handleMessage = (msg) => {
  switch (msg.t) {
    case MSG_WELCOME:
      handleWelcome(msg);
      return;

    case MSG_MEMBERS: {
      const members = msg.members || [];
      syncFromMembers(members);
      conn.dispatch({
        type: types.PRESENCE_MEMBERS_SET,
        payload: { members },
      });
      return;
    }

    case MSG_CAST:
      handleCast(msg);
      return;

    case MSG_ERROR:
      handleError(msg);
      return;

    default:
      console.warn('presence: unknown message', msg.t);
  }
};

const open = () => {
  if (!conn.wanted || isOpen() || isConnecting()) return;
  clearTimer();
  setStatus(conn.opened === 0 ? STATUS_CONNECTING : STATUS_RECONNECTING);

  let ws;
  try {
    ws = new WebSocket(socketUrl());
  } catch (err) {
    conn.attempt += 1;
    scheduleReconnect(backoffDelay());
    return;
  }
  conn.ws = ws;
  conn.opened += 1;

  ws.onopen = () => {
    if (conn.ws !== ws) return;
    // The token is read at hello time, not at connect time: a refresh in
    // between (page load, a rejected token) leaves a different one in storage.
    const { token } = getGameInfo(conn.hash) || {};
    if (!token) {
      giveUpAccess();
      return;
    }
    ws.send(JSON.stringify({ t: MSG_HELLO, hash: conn.hash, token }));
  };
  ws.onmessage = (event) => {
    if (conn.ws !== ws) return;
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (err) {
      console.warn('presence: message is not JSON');
      return;
    }
    if (msg && typeof msg === 'object') handleMessage(msg);
  };
  ws.onclose = (event) => handleClose(ws, event);
  ws.onerror = () => {
    // a close event follows, everything happens there
  };
};

// The tab came back (visible again, network back): do not wait for the backoff.
const wakeUp = () => {
  if (!conn.wanted || isOpen() || isConnecting()) return;
  clearTimer();
  open();
};
const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') wakeUp();
};
// The page is leaving: close without waiting for the browser to drop the
// socket. `wanted` stays as is — a page restored from the back/forward cache
// reconnects through visibilitychange.
const onPageHide = () => closeSocket(null);

const addListeners = () => {
  if (conn.listening || typeof window === 'undefined') return;
  conn.listening = true;
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('online', wakeUp);
  window.addEventListener('pagehide', onPageHide);
};
const removeListeners = () => {
  if (!conn.listening) return;
  conn.listening = false;
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('online', wakeUp);
  window.removeEventListener('pagehide', onPageHide);
};

// `joinTour` is the tour from an invite link: the subscription goes out once,
// right after the first welcome.
export const connect = ({
  hash,
  dispatch,
  reloadUserInfo = null,
  joinTour = null,
}) => {
  if (typeof window === 'undefined' || !hash) return;
  if (conn.wanted && conn.hash === hash) {
    conn.dispatch = dispatch;
    conn.reloadUserInfo = reloadUserInfo;
    if (joinTour) conn.joinTour = joinTour;
    wakeUp();
    return;
  }
  disconnect(CLOSE_NORMAL);
  conn.hash = hash;
  conn.dispatch = dispatch;
  conn.reloadUserInfo = reloadUserInfo;
  conn.joinTour = joinTour;
  conn.wanted = true;
  addListeners();
  open();
};

export const disconnect = (code = CLOSE_NORMAL) => {
  conn.wanted = false;
  clearTimer();
  removeListeners();
  closeSocket(code);
  conn.opened = 0;
  conn.attempt = 0;
  conn.sid = null;
  conn.tour = null;
  conn.followWanted = null;
  conn.joinTour = null;
  conn.guideSid = null;
  conn.followers = new Set();
  conn.autoFollow = false;
  conn.tokenRefreshed = false;
};

// Returns true when the message went out. Ending a tour is remembered here and
// not waited for in a snapshot: nothing should ask that id back after it.
export const send = (msg) => {
  if (msg.t === MSG_LEAD && !msg.on) conn.tour = null;
  if (!isOpen()) return false;
  conn.ws.send(JSON.stringify(msg));
  return true;
};

// The presence connection: one native WebSocket per tab, kept outside Redux the
// way config/request.js keeps the request settings. Redux only ever sees the
// results (status, members, errors) through `dispatch`; the panel and the
// thunks in redux/actions.js drive it through connect / disconnect / send.
//
// Protocol and close codes: brain-platform/docs/presence.md.

import { API_URL } from '@/config/server';
import {
  CAST_VIEWPORT,
  CLOSE_AMBIGUOUS,
  CLOSE_BAD_MESSAGE,
  CLOSE_FULL,
  CLOSE_GAME_NOT_FOUND,
  CLOSE_NORMAL,
  CLOSE_TOKEN,
  FULL_RETRY_MS,
  MSG_CAST,
  MSG_ERROR,
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
  WS_PATH,
} from '@/config/presence';
import { centerViewportAtPosition } from '@/modules/game/game-redux/actions';
import { dropBrokenAccess, refreshTokenRequest } from '@/modules/game/requests';
import {
  getGameInfo,
  setGameInfoIntoStorage,
} from '@/modules/user/contexts/UserContext';
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
  // Leader mode is restored by the client after a reconnect (the server has
  // forgotten it with the old connection); a follow is not — the leader may
  // have a new sid by then, the user picks again from the list.
  leadWanted: false,
  // One token refresh per rejected token; a second rejection drops the access.
  tokenRefreshed: false,
  listening: false,
};

const socketUrl = () => `${API_URL.replace(/^http/, 'ws')}${WS_PATH}`;

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

const handleMessage = (msg) => {
  switch (msg.t) {
    case MSG_WELCOME:
      conn.attempt = 0;
      conn.tokenRefreshed = false;
      conn.dispatch({
        type: types.PRESENCE_WELCOME,
        payload: { sid: msg.sid, members: msg.members || [] },
      });
      if (conn.leadWanted) send({ t: MSG_LEAD, on: true });
      return;

    case MSG_MEMBERS:
      conn.dispatch({
        type: types.PRESENCE_MEMBERS_SET,
        payload: { members: msg.members || [] },
      });
      return;

    case MSG_CAST:
      if (
        msg.kind === CAST_VIEWPORT &&
        Number.isFinite(msg.x) &&
        Number.isFinite(msg.y)
      ) {
        conn.dispatch(centerViewportAtPosition({ x: msg.x, y: msg.y }));
      } else {
        console.warn('presence: unsupported cast', msg.kind);
      }
      return;

    case MSG_ERROR:
      // A rejected command — the connection lives, the panel shows the text.
      conn.dispatch({
        type: types.PRESENCE_ERROR_SET,
        payload: {
          error: msg.message || `Command rejected (${msg.code || 'unknown'})`,
        },
      });
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

export const connect = ({ hash, dispatch, reloadUserInfo = null }) => {
  if (typeof window === 'undefined' || !hash) return;
  if (conn.wanted && conn.hash === hash) {
    conn.dispatch = dispatch;
    conn.reloadUserInfo = reloadUserInfo;
    wakeUp();
    return;
  }
  disconnect(CLOSE_NORMAL);
  conn.hash = hash;
  conn.dispatch = dispatch;
  conn.reloadUserInfo = reloadUserInfo;
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
  conn.leadWanted = false;
  conn.tokenRefreshed = false;
};

// Returns true when the message went out. Remembers the leader mode the user
// asked for, so that it can be restored after a reconnect.
export const send = (msg) => {
  if (msg.t === MSG_LEAD) conn.leadWanted = !!msg.on;
  if (!isOpen()) return false;
  conn.ws.send(JSON.stringify(msg));
  return true;
};

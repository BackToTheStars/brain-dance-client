// Presence in a game (who is online, leader mode, "bring everyone to me").
// Shared by the socket singleton, the Redux slice and the panel. Like the rest
// of config/*, this file imports nothing, so it is safe to import from anywhere
// without closing a cycle (see the header of config/panel.js).
// The protocol itself is described in brain-platform/docs/presence.md.

// Path on the API server; the address is API_URL with http→ws, https→wss.
export const WS_PATH = '/ws';

// Connection status as seen by the user (state.presence.status).
export const STATUS_OFF = 'off';
export const STATUS_CONNECTING = 'connecting';
export const STATUS_ONLINE = 'online';
export const STATUS_RECONNECTING = 'reconnecting';
export const STATUS_ERROR = 'error';

// Message types: client → server.
export const MSG_HELLO = 'hello';
export const MSG_LEAD = 'lead';
export const MSG_FOLLOW = 'follow';
export const MSG_CAST = 'cast';
// Message types: server → client.
export const MSG_WELCOME = 'welcome';
export const MSG_MEMBERS = 'members';
export const MSG_ERROR = 'error';

// The only broadcast kind of this stage: the centre of the leader's viewport.
export const CAST_VIEWPORT = 'viewport';

// Reconnect: 1 → 2 → 4 → … → 30 s, ±25 % jitter, reset after `welcome`.
export const RECONNECT_BASE_MS = 1000;
export const RECONNECT_MAX_MS = 30000;
export const RECONNECT_JITTER = 0.25;
// The game already holds the maximum number of connections: retry in a minute.
export const FULL_RETRY_MS = 60000;

// Close codes. Standard ones first, then the server's own 4xxx range.
export const CLOSE_NORMAL = 1000; // the user switched online off
export const CLOSE_GOING_AWAY = 1001; // the tab leaves the canvas
export const CLOSE_SERVER_RESTART = 1012;
export const CLOSE_BAD_MESSAGE = 4400; // not JSON, a message before hello, no hash/token
export const CLOSE_TOKEN = 4401; // signature, another game, old format or expired
export const CLOSE_GAME_NOT_FOUND = 4404;
export const CLOSE_HELLO_TIMEOUT = 4408; // hello did not arrive within 5 s
export const CLOSE_AMBIGUOUS = 4409; // the game hash matches several games
export const CLOSE_FULL = 4413; // the game already holds 100 connections

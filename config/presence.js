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

// What a guide broadcasts: the centre of their viewport (by the button),
// while "Show my cursor" is on, the position of their mouse over the canvas,
// and, while "Pencil" is on, the strokes they draw over it.
export const CAST_VIEWPORT = 'viewport';
export const CAST_CURSOR = 'cursor';
export const CAST_DRAW = 'draw';

// The guide's cursor is sent at most once per CURSOR_SEND_MS and only when it
// has moved at least CURSOR_MIN_MOVE_PX from the last sent point: a mouse
// produces far more events than a tour needs, and the server drops the excess.
export const CURSOR_SEND_MS = 50;
export const CURSOR_MIN_MOVE_PX = 2;

// Operations of `cast draw`: a stroke opens, grows by portions of points and
// closes; the eraser takes one stroke away, switching the pencil off takes all
// of them. Nothing is stored on the server, so a late follower sees new
// strokes only.
export const DRAW_START = 'start';
export const DRAW_MOVE = 'move';
export const DRAW_END = 'end';
export const DRAW_REMOVE = 'remove';
export const DRAW_CLEAR = 'clear';

// The pen is sampled like the cursor: one portion per DRAW_SEND_MS, a point
// closer than DRAW_MIN_MOVE_PX to the previous one dropped. A portion carries
// at most DRAW_MAX_POINTS points — a longer one is refused by the server.
export const DRAW_SEND_MS = 50;
export const DRAW_MIN_MOVE_PX = 2;
export const DRAW_MAX_POINTS = 150;
// How many hex characters a stroke id has (the server allows up to 32).
export const DRAW_ID_LENGTH = 8;

// The class of the layer that takes the pointer while the pencil is on: shared
// by the layer itself and by the listeners that read the events from it.
export const DRAW_CAPTURE_CLASS = 'draw-capture';

// The invite link is `/game/view/<hash>?tour=<tourId>`: this is the parameter
// name, shared by the link builder, the canvas page and the socket.
export const TOUR_PARAM = 'tour';

// `error.code` from the server: a rejected command, the connection lives.
export const ERROR_LEADER = 'leader'; // I am a guide myself
export const ERROR_NO_LEADER = 'no-leader'; // no such tour (it is over)
export const ERROR_NOT_LEADER = 'not-leader'; // only a guide broadcasts
export const ERROR_BAD_CAST = 'bad-cast';
export const ERROR_BAD_MESSAGE = 'bad-message';
export const ERROR_ROLE = 'role'; // only players and the owner start a tour

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

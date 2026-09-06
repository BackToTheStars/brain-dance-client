import { PANEL_PRESENCE } from '@/config/panel';
import {
  CAST_CURSOR,
  CAST_DRAW,
  CAST_VIEWPORT,
  CLOSE_GOING_AWAY,
  CLOSE_NORMAL,
  CURSOR_MIN_MOVE_PX,
  CURSOR_SEND_MS,
  DRAW_CLEAR,
  DRAW_END,
  DRAW_MOVE,
  DRAW_REMOVE,
  DRAW_START,
  MSG_CAST,
  MSG_FOLLOW,
  MSG_LEAD,
} from '@/config/presence';
import { togglePanel } from '@/modules/panels/redux/actions';
import { startTracking, stopTracking } from '../cursor';
import { isStroking, startDrawing, stopDrawing } from '../draw';
import * as socket from '../socket';
import * as types from './types';

// Online is one state: the socket and the presence panel open and close
// together, and the "Close" button of the panel is the same as switching
// online off in the Info panel.
const goOffline = (dispatch, code) => {
  // The socket goes with it, so there is nobody left to tell: just let the
  // canvas listeners go. The reset takes the marks off the canvas with them.
  stopTracking();
  stopDrawing();
  socket.disconnect(code);
  dispatch({ type: types.PRESENCE_RESET });
  dispatch(togglePanel({ type: PANEL_PRESENCE, open: false }));
};

// `reloadUserInfo` comes from the user context of the component that flips the
// switch: the socket needs it only when the server rejects the stored token and
// a refreshed one lands in localStorage — the context does not re-read the
// storage on its own. `joinTour` is the tour from an invite link: the canvas
// switches online by itself and joins that tour once it is connected.
export const setOnline =
  (on, { reloadUserInfo = null, joinTour = null } = {}) =>
  (dispatch, getState) => {
    if (!on) {
      goOffline(dispatch, CLOSE_NORMAL);
      return;
    }
    const hash = getState().game.game?.hash;
    if (!hash) return;
    dispatch(togglePanel({ type: PANEL_PRESENCE, open: true }));
    socket.connect({ hash, dispatch, reloadUserInfo, joinTour });
  };

// Leaving the canvas (lobby, another game): the tab "goes away", nothing is
// kept for the next canvas.
export const leaveGame = () => (dispatch) => {
  goOffline(dispatch, CLOSE_GOING_AWAY);
};

// Any deliberate step of mine clears both the last refusal and the "Tour ended"
// notice — it stands only until the user does something about it.
const clearNotices = (dispatch) => {
  dispatch({ type: types.PRESENCE_ERROR_SET, payload: { error: null } });
  dispatch({
    type: types.PRESENCE_TOUR_ENDED_SET,
    payload: { tourEnded: false },
  });
};

// Start a tour (a new one — the id comes back in the next snapshot) or end it.
// Coming back to a tour after a break is the socket's own business: it knows
// the id and asks for it as soon as the connection is up again.
export const setLead = (on) => (dispatch) => {
  clearNotices(dispatch);
  if (!on) {
    dispatch(setCursorSharing(false));
    // The tour is over in a moment: the followers take the marks off by the
    // next snapshot themselves, so there is nothing to broadcast.
    dispatch(setPencil(false, { cast: false }));
  }
  socket.send({ t: MSG_LEAD, on: !!on });
};

// The id of a tour to join, or null to leave the one I am on.
export const follow = (tour) => (dispatch) => {
  clearNotices(dispatch);
  socket.send({ t: MSG_FOLLOW, tour: tour || null });
};

// The centre of my viewport in canvas coordinates: followers centre theirs on
// the same point. `state.game.position` and `state.game.viewport` are the live
// values (the viewport in state.ui is not maintained).
export const castViewport = () => (dispatch, getState) => {
  const { position, viewport } = getState().game;
  clearNotices(dispatch);
  socket.send({
    t: MSG_CAST,
    kind: CAST_VIEWPORT,
    x: position.x + Math.floor(viewport.width / 2),
    y: position.y + Math.floor(viewport.height / 2),
  });
};

// A mouse fires far more events than a tour needs: one frame per 50 ms, and
// only when the pointer has actually gone somewhere.
let lastCursorCast = { x: null, y: null, at: 0 };

export const castCursor = (x, y) => () => {
  // While a stroke is being drawn the pen is the cursor: one stream instead of
  // two, and both of them together stay inside the frame budget of the tour.
  if (isStroking()) return;
  const now = Date.now();
  if (now - lastCursorCast.at < CURSOR_SEND_MS) return;
  if (
    lastCursorCast.x !== null &&
    Math.abs(x - lastCursorCast.x) < CURSOR_MIN_MOVE_PX &&
    Math.abs(y - lastCursorCast.y) < CURSOR_MIN_MOVE_PX
  )
    return;
  lastCursorCast = { x, y, at: now };
  socket.send({ t: MSG_CAST, kind: CAST_CURSOR, x, y });
};

// The pointer left the canvas, the switch went off, the tour ended: one frame
// that takes the marker off the followers' canvas.
export const castCursorOff = () => () => {
  lastCursorCast = { x: null, y: null, at: 0 };
  socket.send({ t: MSG_CAST, kind: CAST_CURSOR, off: true });
};

// "Show my cursor": my own switch, the server knows nothing about it. Turning
// it off tells the followers to take the marker away.
export const setCursorSharing = (on) => (dispatch, getState) => {
  if (!on) {
    const wasOn = getState().presence.cursorSharing;
    stopTracking();
    dispatch({
      type: types.PRESENCE_CURSOR_SHARING_SET,
      payload: { on: false },
    });
    if (wasOn) dispatch(castCursorOff());
    return;
  }
  const started = startTracking({
    getPosition: () => getState().game.position,
    onMove: (x, y) => dispatch(castCursor(x, y)),
    onLeave: () => dispatch(castCursorOff()),
  });
  dispatch({
    type: types.PRESENCE_CURSOR_SHARING_SET,
    payload: { on: started },
  });
};

// One frame of the pencil. The guide draws locally at once and does not wait
// for an echo — the server forwards to the followers and keeps nothing.
const castDraw = (body) =>
  socket.send({ t: MSG_CAST, kind: CAST_DRAW, ...body });

// The pen went down: the stroke opens on my own canvas and on the followers'.
const strokeStarted = (id, x, y) => (dispatch, getState) => {
  dispatch({
    type: types.PRESENCE_STROKE_START,
    payload: { id, from: getState().presence.sid, points: [x, y] },
  });
  castDraw({ op: DRAW_START, id, x, y });
};

const strokeGrew = (id, points) => (dispatch, getState) => {
  dispatch({
    type: types.PRESENCE_STROKE_POINTS,
    payload: { id, from: getState().presence.sid, points },
  });
  castDraw({ op: DRAW_MOVE, id, points });
};

const attachPen = (dispatch, getState) =>
  startDrawing({
    getPosition: () => getState().game.position,
    onStart: (id, x, y) => dispatch(strokeStarted(id, x, y)),
    onPoints: (id, points) => dispatch(strokeGrew(id, points)),
    onEnd: (id) => castDraw({ op: DRAW_END, id }),
  });

// "Pencil": my own switch, like "Show my cursor" — the server knows nothing
// about it. Switching it off is the way to erase everything: the marks go from
// my canvas and, by one frame, from the followers'. `cast: false` is for the
// cases where there is nobody to tell any more (the tour is ending, online is
// going off): the followers erase by the members snapshot themselves.
export const setPencil =
  (on, { cast = true } = {}) =>
  (dispatch, getState) => {
    if (!on) {
      const wasOn = getState().presence.pencil;
      stopDrawing();
      dispatch({ type: types.PRESENCE_PENCIL_SET, payload: { on: false } });
      dispatch({ type: types.PRESENCE_STROKES_CLEAR, payload: { from: null } });
      if (wasOn && cast) castDraw({ op: DRAW_CLEAR });
      return;
    }
    const started = attachPen(dispatch, getState);
    dispatch({ type: types.PRESENCE_PENCIL_SET, payload: { on: started } });
  };

// "Eraser": the same layer switched to picking strokes instead of drawing them
// — the pen stops listening and the marks themselves take the clicks.
export const setEraser = (on) => (dispatch, getState) => {
  if (on && !getState().presence.pencil) return;
  if (on) stopDrawing();
  else attachPen(dispatch, getState);
  dispatch({ type: types.PRESENCE_ERASER_SET, payload: { on: !!on } });
};

// A mark clicked with the eraser: it goes from my canvas and from theirs.
export const eraseStroke = (id) => (dispatch) => {
  dispatch({ type: types.PRESENCE_STROKE_REMOVE, payload: { id } });
  castDraw({ op: DRAW_REMOVE, id });
};

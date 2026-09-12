import { PANEL_PRESENCE } from '@/config/panel';
import {
  CAST_CURSOR,
  CAST_DRAW,
  CAST_SAVED,
  CAST_VIEWPORT,
  CAST_VIEWPORT_REPORT,
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
  STATUS_OFF,
  STATUS_ONLINE,
  VIEWPORT_REPORT_MS,
} from '@/config/presence';
import { togglePanel } from '@/modules/panels/redux/actions';
import { startTracking, stopTracking } from '../cursor';
import { isStroking, startDrawing, stopDrawing } from '../draw';
import * as socket from '../socket';
import { selectFollowing, selectGuideSid, selectMyTour } from './selectors';
import * as types from './types';

// What a follower does on the guide's "saved" frame. It lives in its own file
// (the socket dispatches it, and this file imports the socket); exported from
// here too, so that the thunks of the presence module are all in one place.
export { refreshAfterSave } from './refresh';

// Online is one state: the socket and the presence panel open and close
// together, and the "Go offline" button of the panel is the same as switching
// online off in the Info panel.
const goOffline = (dispatch, code) => {
  // The socket goes with it, so there is nobody left to tell: just let the
  // canvas listeners go. The reset takes the marks off the canvas with them.
  stopTracking();
  stopDrawing();
  forgetViewportReport();
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

// Entering under another code while online: the member is built from the token
// that came with `hello`, so a new role or nickname needs a new connection —
// and the presence state starts over, losing a subscription to a tour.
export const reconnectWithNewAccess =
  ({ reloadUserInfo = null } = {}) =>
  (dispatch, getState) => {
    const state = getState();
    if (state.presence.status === STATUS_OFF) return;
    const hash = state.game.game?.hash;
    if (!hash) return;
    stopTracking();
    stopDrawing();
    forgetViewportReport();
    socket.disconnect(CLOSE_NORMAL);
    dispatch({ type: types.PRESENCE_RESET });
    socket.connect({ hash, dispatch, reloadUserInfo });
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
    // Nobody follows an ended tour: the group leaves the minimap with it.
    dispatch(setGroupOnMinimap(false));
    dispatch({ type: types.PRESENCE_VIEWPORTS_CLEAR });
  }
  socket.send({ t: MSG_LEAD, on: !!on });
};

// "Group on minimap": my own switch, the server knows nothing
// about it. The rectangles of the followers are kept all the while I guide,
// so switching it on shows the group at once, without waiting for them to move.
export const setGroupOnMinimap = (on) => (dispatch) => {
  dispatch({ type: types.PRESENCE_GROUP_ON_MINIMAP_SET, payload: { on: !!on } });
};

// "Lines on top": my own switch as a follower, the server knows nothing about
// it, and the snapshot of a tour I no longer follow drops it.
export const setLinesOnTop = (on) => (dispatch) => {
  dispatch({ type: types.PRESENCE_LINES_ON_TOP_SET, payload: { on: !!on } });
};

// "Save Field" went through: one frame that tells the followers to fetch the
// saved geometry and content again. Only a guide sends it — from anyone else
// the server would answer with an error the panel would show.
export const castSaved = () => (dispatch, getState) => {
  if (!selectMyTour(getState())) return;
  socket.send({ t: MSG_CAST, kind: CAST_SAVED });
};

// The rectangle of the canvas I see, for the guide's minimap: the last frame
// sent (to compare the next one with — the same rectangle to the same guide is
// not sent twice) and the trailing timer of the throttle.
const viewportReport = { last: null, timer: null };

const forgetViewportReport = () => {
  if (viewportReport.timer) {
    clearTimeout(viewportReport.timer);
    viewportReport.timer = null;
  }
  viewportReport.last = null;
};

const sendViewportReport = (getState) => {
  const state = getState();
  if (state.presence.status !== STATUS_ONLINE || !selectFollowing(state)) {
    forgetViewportReport();
    return;
  }
  const { position, viewport } = state.game;
  const frame = {
    x: position.x,
    y: position.y,
    width: viewport.width,
    height: viewport.height,
    to: selectGuideSid(state),
  };
  if (
    ![frame.x, frame.y, frame.width, frame.height].every(Number.isFinite) ||
    frame.width <= 0 ||
    frame.height <= 0
  )
    return;
  const { last } = viewportReport;
  if (
    last &&
    last.x === frame.x &&
    last.y === frame.y &&
    last.width === frame.width &&
    last.height === frame.height &&
    last.to === frame.to
  )
    return;
  viewportReport.last = { ...frame, at: Date.now() };
  socket.send({
    t: MSG_CAST,
    kind: CAST_VIEWPORT_REPORT,
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
  });
};

// Report my viewport to the guide of the tour I follow. The canvas calls this
// on every change of the position or the window, when the subscription starts
// and when the guide comes back with a new sid (the server keeps nothing, so
// a guide with a fresh connection has an empty minimap until the followers
// report again). Throttled to one frame per VIEWPORT_REPORT_MS with a trailing
// timer, so the last frame always goes. Not following (any more): the memory
// of the last frame goes too, so that the next subscription reports even from
// the same spot.
export const reportViewport = () => (dispatch, getState) => {
  const state = getState();
  if (state.presence.status !== STATUS_ONLINE || !selectFollowing(state)) {
    forgetViewportReport();
    return;
  }
  const since = Date.now() - (viewportReport.last?.at || 0);
  if (since >= VIEWPORT_REPORT_MS) {
    if (viewportReport.timer) {
      clearTimeout(viewportReport.timer);
      viewportReport.timer = null;
    }
    sendViewportReport(getState);
    return;
  }
  if (viewportReport.timer) return;
  viewportReport.timer = setTimeout(() => {
    viewportReport.timer = null;
    sendViewportReport(getState);
  }, VIEWPORT_REPORT_MS - since);
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

// "Share cursor": my own switch, the server knows nothing about it. Turning
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

// Drawing is local state. "Clear & exit" turns it off and erases everything: marks go from
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

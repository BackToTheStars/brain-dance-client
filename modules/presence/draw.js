// The guide's pencil over the canvas, while "Pencil" is on. Kept outside Redux
// like cursor.js: a set of pointer listeners on `#game-box`, and the only thing
// they produce are points in canvas coordinates.
//
// The listeners sit on the box, not on the capture layer above it: the layer is
// rendered by React only after the switch is flipped, while the box is always
// there, and events from the layer bubble up to it anyway. The layer's own job
// is to keep the canvas from being dragged and to show the crosshair — a stroke
// starts only when the pointer went down on it.
//
// Points are batched: a portion leaves once per DRAW_SEND_MS and a point closer
// than DRAW_MIN_MOVE_PX to the previous one is dropped, so a pen that fires
// hundreds of events a second still fits into the frame budget of the tour.

import {
  DRAW_CAPTURE_CLASS,
  DRAW_ID_LENGTH,
  DRAW_MAX_POINTS,
  DRAW_MIN_MOVE_PX,
  DRAW_SEND_MS,
} from '@/config/presence';
import { canvasPoint } from './cursor';

const GAME_BOX_ID = 'game-box';

const pen = {
  box: null,
  getPosition: null,
  onStart: null,
  onPoints: null,
  onEnd: null,
  // The stroke being drawn right now: its id, the points not sent yet, the last
  // point taken and when the last portion went out.
  strokeId: null,
  pending: [],
  lastX: 0,
  lastY: 0,
  sentAt: 0,
  timer: null,
};

const newStrokeId = () => {
  let id = '';
  while (id.length < DRAW_ID_LENGTH)
    id += Math.floor(Math.random() * 16).toString(16);
  return id;
};

const clearTimer = () => {
  if (pen.timer) {
    clearTimeout(pen.timer);
    pen.timer = null;
  }
};

// Everything collected so far goes out, cut into portions the server accepts.
const flush = () => {
  clearTimer();
  if (!pen.strokeId || !pen.pending.length) return;
  const points = pen.pending;
  pen.pending = [];
  pen.sentAt = Date.now();
  for (let at = 0; at < points.length; at += DRAW_MAX_POINTS * 2)
    pen.onPoints(pen.strokeId, points.slice(at, at + DRAW_MAX_POINTS * 2));
};

// Trailing throttle: the portion leaves at once if the previous one is old
// enough, otherwise a timer takes it when the interval is over — a stroke that
// stops without the button being released still reaches the followers.
const schedule = () => {
  const left = DRAW_SEND_MS - (Date.now() - pen.sentAt);
  if (left <= 0) {
    flush();
    return;
  }
  if (pen.timer) return;
  pen.timer = setTimeout(() => {
    pen.timer = null;
    flush();
  }, left);
};

const finishStroke = () => {
  if (!pen.strokeId) return;
  const id = pen.strokeId;
  flush();
  pen.strokeId = null;
  pen.pending = [];
  clearTimer();
  pen.onEnd(id);
};

const handleDown = (event) => {
  if (!pen.box || pen.strokeId) return;
  // Only the capture layer starts a stroke: everything else on the canvas
  // (a card, the lines) belongs to the usual work with the game.
  if (!event.target?.classList?.contains(DRAW_CAPTURE_CLASS)) return;
  // No text selection and no native drag under the pen.
  event.preventDefault();
  const { x, y } = canvasPoint(pen.box, pen.getPosition(), event);
  pen.strokeId = newStrokeId();
  pen.pending = [];
  pen.lastX = x;
  pen.lastY = y;
  pen.sentAt = Date.now();
  pen.onStart(pen.strokeId, x, y);
};

const handleMove = (event) => {
  if (!pen.box || !pen.strokeId) return;
  const { x, y } = canvasPoint(pen.box, pen.getPosition(), event);
  if (
    Math.abs(x - pen.lastX) < DRAW_MIN_MOVE_PX &&
    Math.abs(y - pen.lastY) < DRAW_MIN_MOVE_PX
  )
    return;
  pen.lastX = x;
  pen.lastY = y;
  pen.pending.push(x, y);
  schedule();
};

const handleUp = () => finishStroke();

// Returns false when there is no canvas to listen to yet — the caller then
// leaves the switch off instead of showing a state that does nothing.
export const startDrawing = ({ getPosition, onStart, onPoints, onEnd }) => {
  if (typeof document === 'undefined') return false;
  const box = document.getElementById(GAME_BOX_ID);
  if (!box) return false;
  stopDrawing();
  pen.box = box;
  pen.getPosition = getPosition;
  pen.onStart = onStart;
  pen.onPoints = onPoints;
  pen.onEnd = onEnd;
  box.addEventListener('pointerdown', handleDown);
  box.addEventListener('pointermove', handleMove);
  box.addEventListener('pointerup', handleUp);
  box.addEventListener('pointercancel', handleUp);
  box.addEventListener('pointerleave', handleUp);
  return true;
};

// The pencil went off, the eraser took over, the tour or the canvas is gone:
// an unfinished stroke is dropped without a word — whoever stops the pen also
// takes the strokes away.
export const stopDrawing = () => {
  clearTimer();
  pen.strokeId = null;
  pen.pending = [];
  if (!pen.box) return;
  pen.box.removeEventListener('pointerdown', handleDown);
  pen.box.removeEventListener('pointermove', handleMove);
  pen.box.removeEventListener('pointerup', handleUp);
  pen.box.removeEventListener('pointercancel', handleUp);
  pen.box.removeEventListener('pointerleave', handleUp);
  pen.box = null;
  pen.getPosition = null;
  pen.onStart = null;
  pen.onPoints = null;
  pen.onEnd = null;
};

// While a stroke is being drawn the pen is the cursor: the cursor stream stops
// so that the two of them together stay inside the frame budget.
export const isStroking = () => !!pen.strokeId;

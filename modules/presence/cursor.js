// The guide's mouse over the canvas, while "Show my cursor" is on. Kept outside
// Redux like socket.js: it is a pair of DOM listeners on `#game-box`, and the
// only thing it produces is a point in canvas coordinates.
//
// The coordinates are built exactly the way a turn card is placed on the
// canvas — screen position plus the canvas offset — so the point lands on the
// same card for everyone, whatever each of them has dragged the canvas to.

const GAME_BOX_ID = 'game-box';

const tracker = {
  box: null,
  getPosition: null,
  onMove: null,
  onLeave: null,
};

const handleMove = (event) => {
  if (!tracker.box) return;
  // The rectangle is read at event time: dragging the canvas moves the box
  // itself while the stored position only catches up when the drag stops.
  const rect = tracker.box.getBoundingClientRect();
  const position = tracker.getPosition() || { x: 0, y: 0 };
  tracker.onMove(
    Math.round(event.clientX - rect.left + (position.x || 0)),
    Math.round(event.clientY - rect.top + (position.y || 0)),
  );
};

const handleLeave = () => {
  if (!tracker.box) return;
  tracker.onLeave();
};

// Returns false when there is no canvas to listen to yet — the caller then
// leaves the switch off instead of showing a state that does nothing.
export const startTracking = ({ getPosition, onMove, onLeave }) => {
  if (typeof document === 'undefined') return false;
  const box = document.getElementById(GAME_BOX_ID);
  if (!box) return false;
  stopTracking();
  tracker.box = box;
  tracker.getPosition = getPosition;
  tracker.onMove = onMove;
  tracker.onLeave = onLeave;
  box.addEventListener('mousemove', handleMove);
  box.addEventListener('mouseleave', handleLeave);
  return true;
};

export const stopTracking = () => {
  if (!tracker.box) return;
  tracker.box.removeEventListener('mousemove', handleMove);
  tracker.box.removeEventListener('mouseleave', handleLeave);
  tracker.box = null;
  tracker.getPosition = null;
  tracker.onMove = null;
  tracker.onLeave = null;
};

export const isTracking = () => !!tracker.box;

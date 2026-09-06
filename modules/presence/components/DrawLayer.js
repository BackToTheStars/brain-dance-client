'use client';
import { useDispatch, useSelector } from 'react-redux';

import { DRAW_CAPTURE_CLASS } from '@/config/presence';
import { TID } from '@/config/testIds';
import { eraseStroke } from '../redux/actions';

// The pencil marks of a tour, and the layer the guide draws them on. Both live
// inside `#game-box`, so they travel with the canvas on their own — while it is
// dragged and while "Bring everyone to me" animates it — and their coordinates
// only have to undo the canvas offset, exactly as a turn card does.
//
// The capture layer is there while the pencil is on: it takes the pointer (so
// the canvas is not dragged from under the pen — `not-draggable` is what the
// draggable of the canvas cancels on) and keeps a double click from reaching
// the canvas, where it would toggle the edit mode. With the eraser on it lets
// the pointer through instead, and the invisible twin of each mark takes the
// click — the twin is `not-draggable` too, so erasing a mark never drags the
// canvas along with it.
const DrawLayer = () => {
  const dispatch = useDispatch();
  const strokes = useSelector((state) => state.presence.strokes);
  const pencil = useSelector((state) => state.presence.pencil);
  const eraser = useSelector((state) => state.presence.eraser);
  const position = useSelector((state) => state.game.position);

  const offsetX = position?.x || 0;
  const offsetY = position?.y || 0;
  const screenPoints = (points) => {
    const pairs = [];
    for (let at = 0; at + 1 < points.length; at += 2)
      pairs.push(`${points[at] - offsetX},${points[at + 1] - offsetY}`);
    return pairs.join(' ');
  };

  const captureClasses = [DRAW_CAPTURE_CLASS, 'not-draggable'];
  if (eraser) captureClasses.push('draw-capture_erasing');

  return (
    <>
      {pencil && (
        <div
          className={captureClasses.join(' ')}
          data-test-id={TID.presence.drawCapture}
          data-erasing={eraser ? 'true' : 'false'}
          onDoubleClick={(event) => event.stopPropagation()}
        />
      )}
      <svg className="draw-layer" data-test-id={TID.presence.drawLayer}>
        {Object.keys(strokes).map((id) => {
          const points = screenPoints(strokes[id].points);
          return (
            <g key={id}>
              <polyline
                className="draw-layer__line"
                points={points}
                data-test-id={TID.presence.stroke}
                data-id={id}
                data-from={strokes[id].from || ''}
              />
              {eraser && (
                <polyline
                  className="draw-layer__hit not-draggable"
                  points={points}
                  onClick={() => dispatch(eraseStroke(id))}
                />
              )}
            </g>
          );
        })}
      </svg>
    </>
  );
};

export default DrawLayer;

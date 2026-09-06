'use client';
import { useSelector } from 'react-redux';

import { TID } from '@/config/testIds';
import { selectMyTour } from '../redux/selectors';

// Amber, like the pencil marks — the white frame of the minimap is my own.
const STROKE = '#ffb300';
// In the units of the viewBox, which are the pixels of the minimap.
const FONT_SIZE = 10;
const LABEL_GAP = 3;

// Where the followers of my tour look: one rectangle per follower on the
// minimap, with their nickname at its top-left corner, in the same scale `k`
// the minimap draws the cards and my own frame with. Drawn only while I guide
// and "Show the group on the minimap" is on; the rectangles themselves are
// kept in the slice all the while I guide, so switching it on shows the group
// at once. A follower who has gone past the area of the minimap is cut by its
// edge: the area is not stretched for them, that would be the minimap's own
// logic. The group takes no pointer: a click on it is a click on the map.
const FollowerRects = ({ k }) => {
  const viewports = useSelector((state) => state.presence.viewports);
  const groupOnMinimap = useSelector((state) => state.presence.groupOnMinimap);
  const members = useSelector((state) => state.presence.members);
  const myTour = useSelector(selectMyTour);

  if (!groupOnMinimap || !myTour || !k) return null;

  return (
    <>
      {Object.keys(viewports).map((sid) => {
        const { x, y, width, height } = viewports[sid];
        const nickname =
          members.find((member) => member.sid === sid)?.nickname || '';
        const left = Math.round(x / k);
        const top = Math.round(y / k);
        return (
          <g
            key={sid}
            pointerEvents="none"
            data-test-id={TID.minimap.follower}
            data-sid={sid}
            data-nickname={nickname}
          >
            <rect
              x={left}
              y={top}
              width={Math.round(width / k)}
              height={Math.round(height / k)}
              fill="none"
              stroke={STROKE}
              strokeWidth="2"
            />
            <text
              x={left + LABEL_GAP}
              y={top + FONT_SIZE + LABEL_GAP}
              fontSize={FONT_SIZE}
              fill={STROKE}
            >
              {nickname}
            </text>
          </g>
        );
      })}
    </>
  );
};

export default FollowerRects;

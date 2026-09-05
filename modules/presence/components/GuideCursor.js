'use client';
import { useSelector } from 'react-redux';

import { TID } from '@/config/testIds';

// Where the guide's mouse is, as the followers see it. The marker lives inside
// `#game-box`, so it travels with the canvas on its own — both while the canvas
// is dragged and while "Bring everyone to me" animates it — and its own
// coordinates only have to undo the canvas offset, exactly as a turn card does.
const GuideCursor = () => {
  const cursor = useSelector((state) => state.presence.cursor);
  const position = useSelector((state) => state.game.position);
  const members = useSelector((state) => state.presence.members);

  if (!cursor) return null;

  const guide = members.find((member) => member.sid === cursor.from) || null;
  const nickname = guide?.nickname || '';

  return (
    <div
      className="guide-cursor"
      data-test-id={TID.presence.guideCursor}
      data-sid={cursor.from}
      data-nickname={nickname}
      style={{
        left: `${cursor.x - (position.x || 0)}px`,
        top: `${cursor.y - (position.y || 0)}px`,
      }}
    >
      <span className="guide-cursor__point" />
      <span className="guide-cursor__name">{nickname}</span>
    </div>
  );
};

export default GuideCursor;

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const TurnInfo = () => {
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const turn = useSelector((state) => state.turns.d[editTurnId]) || {}

  const ref = useRef();
  useEffect(() => {
    if (!ref) {
      return;
    }
    if (typeof $ === 'undefined') return;
    const el = $(ref.current.parentNode);
    el.draggable();
    return () => el.draggable('destroy');
  }, []);

  return (
    <div ref={ref} className="p-3">
      <h4>{turn.header}</h4>
      <p>
        Turn Info
      </p>
    </div>
  );
};

export default TurnInfo;

import { loadTurns } from '@/modules/lobby/redux/actions';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TurnCard from '../elements/TurnCard';

const TurnsPanel = ({ connectedWidth }) => {
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    setWidth(wrapperRef.current.clientWidth);
  }, [connectedWidth, wrapperRef.current]);

  return (
    <div ref={wrapperRef}>
      <TurnsPanelInner width={width} />
    </div>
  );
};

const MIN_TURN_WIDTH = 200;
const MAX_TURN_WIDTH = 500;
const desiredNumCols = 3;

const TurnsPanelInner = ({ width }) => {
  const dispatch = useDispatch();
  const columnCount = useSelector((s) => s.lobby.textSettings.columnCount);
  const mode = useSelector((s) => s.lobby.mode);
  const turns = useSelector((s) => s.lobby.turns);

  const numCols = useMemo(() => {
    const maxCols = Math.floor(width / MIN_TURN_WIDTH);
    const minCols = Math.floor(width / MAX_TURN_WIDTH);
    return Math.min(maxCols, Math.max(minCols, columnCount || desiredNumCols));
  }, [columnCount, width]);

  const turnGroups = useMemo(() => {
    const arrTurns = [];
    for (let i = 0; i < numCols; i++) {
      arrTurns.push([]);
    }
    for (let i = 0; i < turns.length; i += numCols) {
      for (let j = 0; j < numCols; j += 1) {
        if (!turns[i + j]) continue;
        arrTurns[j].push(turns[i + j]);
      }
    }
    return arrTurns;
  }, [numCols, turns]);

  useEffect(() => {
    dispatch(loadTurns());
  }, [mode]);

  return (
    <div className="flex flex-col h-full pr-2">
      <div className="flex-1 overflow-auto lobby-block">
        {/* { width } */}
        {/* {JSON.stringify(turns, null, 2)} */}
      </div>
      <div className="flex gap-4">
        {turnGroups.map((innerTurns, i) => (
          <div
            key={i}
            style={{ width: `${Math.floor(100 / numCols)}%` }}
            className="turn-group flex flex-col flex-1 gap-2"
          >
            {innerTurns.map((turn) => (
              <div key={turn._id} className="turn-group__item">
                <TurnCard id={turn._id} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TurnsPanel;

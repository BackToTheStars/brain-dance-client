'use client'
import { useEffect, useMemo, useState } from 'react';
import GamesPanel from './GamesPanel';
import { VerticalSplit } from '../elements/VerticalSplit';
import TurnsPanel from './TurnsPanel';

const MIN_LEFT_SIDE_WIDTH = 400;

const MainContent = ({ leftSideWidth, setLeftSideWidth }) => {
  const [minMaxDelta, setMinMaxDelta] = useState([null, null]);

  const leftSideStyle = useMemo(() => {
    return {
      width: leftSideWidth ? `${leftSideWidth}px` : `calc(50% - 4 * var(--block-padding-unit))`,
      // transition: 'width 0.05s linear',
    };
  }, [leftSideWidth]);

  const move = (delta) => {
    if (typeof window === 'undefined') return;
    const [minDelta, maxDelta] = minMaxDelta;
    if (minDelta === null || maxDelta === null) return;
    if (delta > maxDelta) return;
    if (delta < minDelta) return;
    const middle = Math.floor(window.innerWidth / 2);
    if (leftSideWidth !== middle + delta) {
      setLeftSideWidth(middle + delta);
    }
  };

  useEffect(() => {
    // @todo: пересчитывать при ресайзе window
    setMinMaxDelta([
      -Math.floor(window.innerWidth / 2) + MIN_LEFT_SIDE_WIDTH,
      0,
    ]);
  }, []);

  return (
    <div className="lobby-block pb-4 flex flex-1 overflow-hidden">
      <div style={leftSideStyle} className="lobby-block flex flex-col gap-2 pt-2">
        <GamesPanel />
      </div>
      <VerticalSplit move={move} />
      <div className="flex-1 overflow-auto pt-2">
        <TurnsPanel connectedWidth={leftSideWidth} />
      </div>
    </div>
  );
};

export default MainContent;

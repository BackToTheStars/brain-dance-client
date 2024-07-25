'use client';
import { useMemo, useRef } from 'react';
import GamesPanel from './GamesPanel';
import { VerticalSplit } from '../elements/VerticalSplit';
import TurnsPanel from './TurnsPanel';
import CommonSliderModal from '../sliderModals/CommonSliderModal';
import { useMainLayoutContext } from './MainLayoutContext';
import { useSlider } from './useSlider';

const MIN_LEFT_SIDE_WIDTH = 400;

const minWidthCallback = () => MIN_LEFT_SIDE_WIDTH;
const maxWidthCallback = (wrapper) => Math.round(wrapper.clientWidth / 2);

const MainContent = () => {
  const { leftSideWidth, setLeftSideWidth } = useMainLayoutContext();
  const wrapperRef = useRef(null);

  const { move, setIsDragging } = useSlider(
    leftSideWidth,
    setLeftSideWidth,
    wrapperRef.current,
    minWidthCallback,
    maxWidthCallback,
  );

  const leftSideStyle = useMemo(() => {
    return {
      width: leftSideWidth ? `${leftSideWidth}px` : '50%',
    };
  }, [leftSideWidth]);

  return (
    <div className="lobby-block flex flex-1 overflow-hidden" ref={wrapperRef}>
      <div
        style={leftSideStyle}
        className="lobby-block flex flex-col gap-2 pt-2"
      >
        <GamesPanel />
      </div>
      <VerticalSplit move={move} setIsDragging={setIsDragging} />
      <div className="flex-1 mt-2 relative overflow-hidden">
        <TurnsPanel connectedWidth={leftSideWidth} />
        <CommonSliderModal />
      </div>
    </div>
  );
};

export default MainContent;

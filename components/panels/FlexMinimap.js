import { useUiContext } from '../contexts/UI_Context';

const FlexMinimap = () => {
  const { minimapState, minimapDispatch } = useUiContext();
  const {
    initLeft,
    initTop,
    initBottom,
    initRight,
    left,
    top,
    bottom,
    right,
    zeroX,
    zeroY,
    initZeroX,
    initZeroY,
    turns = [],
  } = minimapState;

  const width = right - left;
  const height = bottom - top;
  const value = { width, height, turns };

  return (
    <div className="flex-minimap">
      <SVGMiniMap {...value} />
    </div>
  );
};

const SVGMiniMap = ({ width, height, turns }) => {
  console.log({ width, height, turns });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%' }}
    >
      {turns.map((turn) => {
        return (
          <rect
            x={turn.x}
            y={turn.y}
            width={turn.width}
            fill="blue"
            height={turn.height}
          ></rect>
        );
      })}
    </svg>
  );
};

export default FlexMinimap;

import { useUiContext } from '../contexts/UI_Context';

const FlexMinimap = () => {
  const { minimapState, minimapDispatch } = useUiContext();
  const { left, right, top, bottom, turns = [] } = minimapState;

  const value = {
    width: right - left, // ширина field
    height: bottom - top, // высота field
    viewport: {
      // смещение viewport - это координата левого верхнего шага
      x: -left,
      y: -top,
      width: window ? window.innerWidth : 1200,
      height: window ? window.innerHeight : 800,
    },
    turns: turns.map((turn) => ({
      ...turn,
      // для получения координаты шага на карте достаточно
      // сместить его координаты на координаты viewport
      x: turn.x - left,
      y: turn.y - top,
    })),
  };
  return (
    <div className="flex-minimap">
      <SVGMiniMap {...value} />
    </div>
  );
};

const SVGMiniMap = ({ width, height, viewport, turns }) => {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%' }}
    >
      {turns.map((turn, i) => {
        return (
          <rect
            key={i}
            x={turn.x}
            y={turn.y}
            width={turn.width}
            fill="rgba(212, 213, 214, 1)"
            height={turn.height}
          />
        );
      })}
      <rect
        x={viewport.x}
        y={viewport.y}
        width={viewport.width}
        height={viewport.height}
        fill="rgba(0, 247, 255, 0.5)"
      />
    </svg>
  );
};
export default FlexMinimap;

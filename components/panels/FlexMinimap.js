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
  const fieldLeftZero = left - zeroX;
  const fieldTopZero = top - zeroY;

  const value = {
    initLeft,
    initTop,
    width,
    height,
    left,
    top,
    turns,
    zeroX,
    zeroY,
    initZeroX,
    initZeroY,
    fieldLeftZero,
    fieldTopZero,
    viewPortWidth: window ? window.innerWidth : 1600,
    viewPortHeight: window ? window.innerHeight : 1200,
  };

  return (
    <div className="flex-minimap">
      <SVGMiniMap {...value} />
    </div>
  );
};

const SVGMiniMap = ({
  initLeft,
  initTop,
  width,
  height,
  left,
  top,
  turns,
  zeroX,
  zeroY,
  initZeroX,
  initZeroY,
  fieldLeftZero,
  fieldTopZero,
  viewPortHeight,
  viewPortWidth,
}) => {
  console.log({
    // width,
    // height,
    // turns,
    // zeroX,
    // zeroY,
    fieldLeftZero,
    fieldTopZero,
  });

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
            x={turn.x - zeroX - fieldLeftZero}
            // zeroX - fieldLeftZero}
            y={turn.y - zeroY - fieldTopZero}
            // zeroY - fieldTopZero}
            width={turn.width}
            fill="blue"
            height={turn.height}
          />
        );
      })}
      <circle cx={zeroX - zeroX} cy={zeroY - zeroY} r={50} fill="red" />
      <circle
        cx={initZeroX - zeroX - initLeft}
        cy={initZeroY - zeroY - initTop}
        // cx={fieldLeftZero - zeroX}
        // cy={fieldTopZero - zeroX}
        r={50}
        fill="green"
      />
      <rect
        x={initZeroX - zeroX - initLeft}
        y={initZeroY - zeroY - initTop}
        width={viewPortWidth}
        height={viewPortHeight}
        fill="rgba(0, 255, 0, 0.7)"
      />
    </svg>
  );
};

export default FlexMinimap;

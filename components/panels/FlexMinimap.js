import { useUiContext } from '../contexts/UI_Context';

const FlexMinimap = () => {
  const { minimapState, minimapDispatch } = useUiContext();
  const { left, right, top, bottom, turns = [] } = minimapState;
  const widthPx = right - left; // ширина всего поля
  const heightPx = bottom - top; // высота всего поля

  const maxMinimapSizeWidthPlusHeight = 1000;
  const minimapWidth =
    (maxMinimapSizeWidthPlusHeight * widthPx) / (widthPx + heightPx);

  console.log({
    maxMinimapSizeWidthPlusHeight,
    widthPx,
    heightPx,
  });

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200;

  const widthK = 0.3; // коэффициент ширины вокруг мини-карты

  const freeSpaceTopBottom = Math.floor(viewportHeight * widthK);
  const freeSpaceLeftRight = Math.floor(viewportWidth * widthK);

  const mapPxToFieldPx = (widthPx + freeSpaceLeftRight * 2) / minimapWidth;

  const viewport = {
    // смещение viewport - это координата левого верхнего шага
    x: -left + freeSpaceLeftRight,
    y: -top + freeSpaceTopBottom,
    width: viewportWidth,
    height: viewportHeight,
  };

  const value = {
    minimapWidth,
    width: widthPx + 2 * freeSpaceLeftRight, // ширина field
    height: heightPx + 2 * freeSpaceTopBottom, // высота field
    viewport,
    onMapClick: (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // координаты клика внутри карты * коэффициент проекции
      const targetXMap = Math.floor((e.clientX - rect.left) * mapPxToFieldPx);
      // - freeSpaceLeftRight;
      const targetYMap = Math.floor((e.clientY - rect.top) * mapPxToFieldPx);
      // - freeSpaceTopBottom;
      const gf = window[Symbol.for('MyGame')].gameField;
      $(gf.stageEl).animate(
        {
          left: `${viewport.x - targetXMap + Math.floor(viewport.width / 2)}px`,
          top: `${viewport.y - targetYMap + Math.floor(viewport.height / 2)}px`,
        },
        300,
        () => {
          gf.triggers.dispatch('RECALCULATE_FIELD');
          gf.triggers.dispatch('DRAW_LINES');
        }
      );
    },
    turns: turns.map((turn) => ({
      ...turn,
      // для получения координаты шага на карте достаточно
      // сместить его координаты на координаты viewport
      x: turn.x - left + freeSpaceLeftRight,
      y: turn.y - top + freeSpaceTopBottom,
    })),
  };
  return (
    <div className="flex-minimap">
      <SVGMiniMap {...value} />
    </div>
  );
};

const SVGMiniMap = ({
  minimapWidth,
  width,
  height,
  viewport,
  turns,
  onMapClick,
}) => {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: `${minimapWidth}px` }}
      onClick={(e) => onMapClick(e)}
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

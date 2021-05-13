import { useUiContext } from '../contexts/UI_Context';
import { useEffect } from 'react';
import {
  useTurnContext,
  ACTION_FIELD_WAS_MOVED,
} from '../contexts/TurnContext';

const FlexMinimap = ({ gameBox }) => {
  const { minimapState, minimapDispatch } = useUiContext();
  const { dispatch: turnsDispatch } = useTurnContext();
  const { left, right, top, bottom, zeroX, zeroY, turns = [] } = minimapState;
  //console.log({ zeroX, zeroY });
  const widthPx = right - left; // ширина всего поля
  const heightPx = bottom - top; // высота всего поля

  const maxMinimapSizeWidthPlusHeight = 800;
  const minimapWidth =
    (maxMinimapSizeWidthPlusHeight * widthPx) / (widthPx + heightPx);

  // console.log({
  //   maxMinimapSizeWidthPlusHeight,
  //   widthPx,
  //   heightPx,
  // });

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200;

  const widthK = 0.3; // коэффициент ширины вокруг мини-карты

  const freeSpaceTopBottom = Math.floor(viewportHeight * widthK);
  const freeSpaceLeftRight = Math.floor(viewportWidth * widthK);

  const mapPxToFieldPx = (widthPx + freeSpaceLeftRight * 2) / minimapWidth;

  const viewport = {
    // смещение viewport - это координата левого верхнего шага
    x: -left + freeSpaceLeftRight - zeroX,
    y: -top + freeSpaceTopBottom - zeroY,
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
      //   const gf = window[Symbol.for('MyGame')].gameField;

      const left = viewport.x - targetXMap + Math.floor(viewport.width / 2);
      const top = viewport.y - targetYMap + Math.floor(viewport.height / 2);

      $(gameBox.current).animate(
        {
          left: `${left}px`,
          top: `${top}px`,
        },
        300,
        () => {
          //   gf.triggers.dispatch('RECALCULATE_FIELD');
          //   gf.triggers.dispatch('DRAW_LINES');
          turnsDispatch({
            type: ACTION_FIELD_WAS_MOVED,
            payload: {
              left,
              top,
            },
          });
          $(gameBox.current).css('left', 0);
          $(gameBox.current).css('top', 0);
        }
      );
    },
    turns: turns
      .map((turn) => ({
        ...turn,
        // для получения координаты шага на карте достаточно
        // сместить его координаты на координаты viewport
        x: turn.x - left + freeSpaceLeftRight - zeroX,
        y: turn.y - top + freeSpaceTopBottom - zeroY,
      }))
      .map((turn) => {
        const isTurnInsideViewport = areRectanglesIntersect(turn, {
          x: viewport.x - viewport.width,
          width: 3 * viewport.width,
          y: viewport.y - viewport.height,
          height: 3 * viewport.height,
        });
        return {
          ...turn,
          isTurnInsideViewport,
        };
      }),
  };

  const turnsToRender = value.turns
    .filter((turn) => turn.isTurnInsideViewport)
    .map((turn) => turn._id); // отфильтровали какие ходы рендерить на экране

  useEffect(() => {
    minimapDispatch({ type: 'TURNS_TO_RENDER', payload: turnsToRender });
  }, [turns]); // массив с id тех ходов, которые нужно render

  return (
    <div className="flex-minimap">
      <SVGMiniMap {...value} />
    </div>
  );
};

const areRectanglesIntersect = (rect1, rect2) => {
  return (
    rect1.x + rect1.width >= rect2.x &&
    rect1.x <= rect2.x + rect2.width &&
    rect1.y + rect1.height >= rect2.y &&
    rect1.y <= rect2.y + rect2.height
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
        // viewport x y width height
        // turn x y width height

        const fill = turn.isTurnInsideViewport
          ? 'blue'
          : 'rgba(212, 213, 214, 1)';

        return (
          <rect
            key={i}
            x={turn.x}
            y={turn.y}
            width={turn.width}
            fill={fill}
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

import { utils } from '@/modules/game/components/helpers/game';
import { changePanelGeometry } from '@/modules/panels/redux/actions';
import { PANEL_CHANGE_GEOMETRY } from '@/modules/panels/redux/types';
import { PANEL_MINIMAP } from '@/modules/panels/settings';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getScreenRect } from './helpers/screen';
import Line from './line/Line';
import MinimapButtons from './MinimapButtons';
import { isTurnInsideRenderArea } from '@/modules/turns/components/helpers/sizeHelper';

const Minimap = ({ settings }) => {
  const dispatch = useDispatch();

  const minimapSizePercents =
    useSelector((state) => state.panels.d[PANEL_MINIMAP].size) || 100;

  const { isMinimized } = settings;
  const gamePosition = useSelector(s => s.game.position);
  // const uiViewport = useSelector(s => s.ui.viewport);
  // const gameInfo = useSelector(s => ({
  //   vx: s.game.game.viewportPointX,
  //   vy: s.game.game.viewportPointY,
  //   x: s.game.game.x,
  //   y: s.game.game.y,
  // }))

  const maxMinimapSizeWidthPlusHeight = Math.round(
    (500 * minimapSizePercents) / 100
  );

  const turnsDictionary = useSelector((state) => state.turns.d);
  const turns = Object.values(turnsDictionary);

  const position = useSelector((state) => state.game.position);

  const setMinimapSizePercents = (size) => {
    dispatch({
      type: PANEL_CHANGE_GEOMETRY,
      payload: { geometryData: { size }, type: PANEL_MINIMAP },
    });
  };

  const lines = [];
  const uiLines = [];

  const { left, right, top, bottom, zeroX, zeroY } = getScreenRect(turns);
  const isHidden = false; // @todo: remove

  const widthPx = Math.round(right - left) || 600; // ширина всего поля
  const heightPx = Math.round(bottom - top) || 400; // высота всего поля

  const minimapWidth = isMinimized
    ? 38
    : (maxMinimapSizeWidthPlusHeight * widthPx) / (widthPx + heightPx);

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200;

  const widthK = 0.3; // коэффициент ширины вокруг мини-карты

  const freeSpaceTopBottom = Math.floor(viewportHeight * widthK);
  const freeSpaceLeftRight = Math.floor(viewportWidth * widthK);

  const mapPxToFieldPx = (widthPx + freeSpaceLeftRight * 2) / minimapWidth;

  const viewport = {
    // смещение viewport - это координата левого верхнего шага
    position: {
      x: -left + freeSpaceLeftRight - zeroX,
      y: -top + freeSpaceTopBottom - zeroY,
    },
    size: {
      width: viewportWidth,
      height: viewportHeight,
    },
  };

  const preparedTurns = turns
    .map((turn) => ({
      ...turn,
      // для получения координаты шага на карте достаточно
      // сместить его координаты на координаты viewport
      position: {
        x: turn.position.x - left + freeSpaceLeftRight - zeroX,
        y: turn.position.y - top + freeSpaceTopBottom - zeroY,
      },
    }))
    .map((turn) => {
      const isTurnInsideViewport = isTurnInsideRenderArea(turn, viewport);
      return {
        ...turn,
        isTurnInsideViewport,
      };
    });

  const value = {
    position,
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

      const left =
        viewport.position.x -
        targetXMap +
        Math.floor(viewport.size.width / 2) +
        zeroX;
      const top =
        viewport.position.y -
        targetYMap +
        Math.floor(viewport.size.height / 2) +
        zeroY;

      utils.moveScene(left, -top, 0);
    },
    turns: preparedTurns.filter((turn) => turn.contentType !== 'zero-point'),
    zeroPoint: preparedTurns.find((turn) => turn.contentType === 'zero-point'),
    gamePosition,
  };

  const turnsToRender = value.turns
    .filter((turn) => turn.isTurnInsideViewport)
    .map((turn) => turn._id); // отфильтровали какие ходы рендерить на экране

  useEffect(() => {
    if (!value.minimapWidth) return;
    if (!turnsToRender.length) return;
    dispatch(changePanelGeometry(PANEL_MINIMAP, { width: value.minimapWidth }));
  }, [value.minimapWidth]);

  useEffect(() => {
    if (turns.length && uiLines.length) {
      setLines(uiLines);
    }
  }, [uiLines, turns]);

  value.lines = getLinesByTurns(value.turns, lines);
  value.isMinimized = isMinimized;

  return (
    <>
      {!isMinimized && <SVGMiniMap {...value} turnsToRender={turnsToRender} />}
      <MinimapButtons
        {...{ minimapSizePercents, setMinimapSizePercents, isMinimized }}
      />
    </>
  );
};

const getLinesByTurns = (turns, lines) => {
  // turns {_id, x, y, width, height}
  // lines {sourceTurnId, targetTurnId}
  const turnCentersDictionary = {};
  for (let turn of turns) {
    turnCentersDictionary[turn._id] = {
      x: Math.floor(turn.position.x + turn.size.width / 2),
      y: Math.floor(turn.position.y + turn.size.height / 2),
    };
  }

  const resLines = [];
  for (let line of lines) {
    if (line.sourceTurnId === line.targetTurnId) {
      continue;
    }
    if (!turnCentersDictionary[line.sourceTurnId]) {
      console.log(`Нет исходного шага у линии ${line._id}`);
      continue;
    }
    if (!turnCentersDictionary[line.targetTurnId]) {
      console.log(`Нет целевого шага у линии ${line._id}`);
      continue;
    }

    resLines.push({
      id: line._id,
      x1: turnCentersDictionary[line.sourceTurnId].position.x,
      y1: turnCentersDictionary[line.sourceTurnId].position.y,
      x2: turnCentersDictionary[line.targetTurnId].position.x,
      y2: turnCentersDictionary[line.targetTurnId].position.y,
    });
  }
  return resLines;
};

const SVGMiniMap = ({
  position,
  minimapWidth,
  width,
  height,
  viewport,
  turns,
  zeroPoint,
  lines,
  onMapClick,
  isMinimized,
  turnsToRender,
  gamePosition,
}) => {
  const dispatch = useDispatch();
  const k = width / minimapWidth;
  // 75 -> 1.5 (x1, y1)
  // 6 -> 4 (x2, y2)
  const tg = (1.5 - 4) / (75 - 6);
  const c = 1.5 - 75 * tg;
  const y = c + tg * k;
  const lineWidth = Math.floor(y * k);

  const viewportRectangleThickness = 3; // толщина линии белого прямоугольника
  const viewportLineWidthCorrection = Math.round(
    (k * viewportRectangleThickness) / 2
  );
  const turnRadius = 2;
  const turnRadiusFactored = Math.round(k * turnRadius);

  // for (let turn of turns) {
  //   if (turn.height < 50) console.log({ id: turn._id, h: turn.height });
  // }

  const minimapHeight = isMinimized
    ? '0'
    : Math.round((minimapWidth * height) / width);

  useEffect(() => {
    if (!turns.length) return;
    dispatch(
      changePanelGeometry(PANEL_MINIMAP, { calculatedHeight: minimapHeight })
    );
  }, [minimapHeight]);

  return (
    <>
      <svg
        viewBox={`${position.left} ${position.top} ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: `${isMinimized ? '0' : minimapWidth}px`,
          height: `${minimapHeight}px`,
        }}
        onClick={(e) => onMapClick(e)}
      >
        {!!zeroPoint && (
          <rect
            // key={zeroPoint._id}
            // x={zeroPoint.position.x - 20}
            // y={zeroPoint.position.y - 20}
            key={'zero'}
            // x={0}
            // x={-gamePosition.left}
            // y={-gamePosition.top}
            // y={-gamePosition.y}
            x={-gamePosition.left}
            y={-gamePosition.top}
            width={40}
            fill={'red'}
            height={40}
          />
        )}
        <g
          filter="url(#blurMe)"
          x={position.left}
          y={position.top}
          width={width}
          height={height}
        >
          {turns.map((turn, i) => {
            // viewport x y width height
            // turn x y width height

            // const fill = turn.isTurnInsideViewport
            //   ? 'blue'
            //   : 'rgba(212, 213, 214, 1)';
            const fill = turnsToRender.includes(turn._id)
              ? 'blue'
              : 'rgba(212, 213, 214, 1)';

            return (
              <rect
                key={turn._id}
                x={turn.position.x}
                y={turn.position.y}
                width={turn.size.width}
                height={turn.size.height}
                rx={turnRadiusFactored}
                fill={fill}
                // fill="gray"
              />
            );
          })}
        </g>
        {lines.map(({ x1, y1, x2, y2, id }) => {
          return (
            <Line
              sourceCoords={{ left: x1, top: y1, height: 0, width: 0 }}
              targetCoords={{ left: x2, top: y2, height: 0, width: 0 }}
              key={id}
              stroke="red"
              strokeWidth={lineWidth}
            />
          );
        })}

        <rect
          className="map-focus"
          rx={turnRadiusFactored}
          // ry={60}
          stroke="#FFFFFF"
          strokeWidth={Math.round(k * viewportRectangleThickness)}
          x={viewport.position.x - viewportLineWidthCorrection}
          y={viewport.position.y - viewportLineWidthCorrection}
          width={viewport.size.width + 2 * viewportLineWidthCorrection}
          height={viewport.size.height + 2 * viewportLineWidthCorrection}
          // fill="rgba(0, 247, 255, 0.5)"
          fill="transparent"
        />

        {turns
          .filter((turn) => turn.isTurnInsideViewport)
          .map((turn) => {
            // viewport x y width height
            // turn x y width height

            const fill = turn.isTurnInsideViewport
              ? 'blue'
              : 'rgba(212, 213, 214, 1)';

            return (
              <rect
                key={`viewport_${turn._id}`}
                x={turn.position.x}
                y={turn.position.y}
                width={turn.size.width}
                height={turn.size.height}
                rx={turnRadiusFactored}
                // fill={fill}
                fill="#489BC1"
                clipPath="url(#viewPort)"
              />
            );
          })}
        <filter id="blurMe">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={Math.round((width * 3) / 1000)}
          />
        </filter>

        <defs>
          <clipPath id="viewPort">
            <rect
              x={viewport.position.x}
              y={viewport.position.y}
              width={viewport.size.width}
              height={viewport.size.height}
            />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};
export default Minimap;

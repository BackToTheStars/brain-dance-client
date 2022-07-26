// import { useUiContext } from '../contexts/UI_Context';
import { panelSpacer } from '@/config/ui';
import { changePanelGeometry } from '@/modules/panels/redux/actions';
import { PANEL_MINIMAP } from '@/modules/panels/settings';
import { moveField } from '@/modules/turns/redux/actions';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getScreenRect } from './helpers/screen';
import Line from './line/Line';
import MinimapButtons from './MinimapButtons';
// import {
// useTurnsCollectionContext,
// ACTION_FIELD_WAS_MOVED,
// } from '../contexts/TurnsCollectionContext';

const Minimap = ({ settings }) => {
  //
  const [minimapSizePercents, setMinimapSizePercents] = useState(100);
  const maxMinimapSizeWidthPlusHeight = Math.round(
    (500 * minimapSizePercents) / 100
  );

  const { isMinimized } = settings;

  const [gameBoxEl, setGameBoxEl] = useState(null);
  const turnsDictionary = useSelector((state) => state.turns.d);
  const turns = Object.values(turnsDictionary);

  const position = useSelector((state) => state.game.position);
  // useSelector((state) => state.turns.updateGeometryTime);

  const dispatch = useDispatch();
  // const isMinimized = useSelector(
  //   (state) => state.panels.d[PANEL_MINIMAP].isMinimized
  // );

  useEffect(() => {
    setGameBoxEl(document.querySelector('#gameBox'));
  }, []);

  const minimapState = {};

  // const { minimapState, minimapDispatch } = useUiContext();
  // const { dispatch: turnsDispatch, lines: uiLines } =
  //   useTurnsCollectionContext();
  // const [lines, setLines] = useState([]);

  const lines = [];
  const uiLines = [];

  const {
    left,
    right,
    top,
    bottom,
    zeroX,
    zeroY,
    // turns = [],
  } = getScreenRect(turns);
  const isHidden = false; // @todo: remove

  const minimapPnlRef = useRef(null);
  const widthPx = Math.round(right - left) || 600; // ширина всего поля
  const heightPx = Math.round(bottom - top) || 400; // высота всего поля

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

  const preparedTurns = turns
    .map((turn) => ({
      ...turn,
      // для получения координаты шага на карте достаточно
      // сместить его координаты на координаты viewport
      x: turn.x - left + freeSpaceLeftRight - zeroX,
      y: turn.y - top + freeSpaceTopBottom - zeroY,
    }))
    .map((turn) => {
      const isTurnInsideViewport = areRectanglesIntersect(turn, {
        // x: viewport.x,
        // width: viewport.width,
        // y: viewport.y,
        // height: viewport.height,
        x: viewport.x - viewport.width,
        width: 3 * viewport.width,
        y: viewport.y - viewport.height,
        height: 3 * viewport.height,
      });
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
        viewport.x - targetXMap + Math.floor(viewport.width / 2) + zeroX;
      const top =
        viewport.y - targetYMap + Math.floor(viewport.height / 2) + zeroY;

      $(gameBoxEl).addClass('remove-line-transition');
      $(gameBoxEl).animate(
        {
          left: `${left}px`,
          top: `${top}px`,
        },
        300,
        () => {
          dispatch(
            moveField({
              left: -left,
              top: -top,
            })
          );
          $(gameBoxEl).css('left', 0);
          $(gameBoxEl).css('top', 0);
          setTimeout(() => {
            $(gameBoxEl).removeClass('remove-line-transition');
          }, 100);
        }
      );
    },
    turns: preparedTurns.filter((turn) => turn.contentType !== 'zero-point'),
    zeroPoint: preparedTurns.find((turn) => turn.contentType === 'zero-point'),
  };

  const turnsToRender = value.turns
    .filter((turn) => turn.isTurnInsideViewport)
    .map((turn) => turn._id); // отфильтровали какие ходы рендерить на экране

  useEffect(() => {
    if (!turns.length) return;
    // @todo: оптимизировать ?
    // minimapDispatch({ type: 'TURNS_TO_RENDER', payload: turnsToRender });
  }, [turns]); // массив с id тех ходов, которые нужно render

  useEffect(() => {
    if (!value.minimapWidth) return;
    dispatch(changePanelGeometry(PANEL_MINIMAP, { width: value.minimapWidth }));
  }, [value.minimapWidth]);

  useEffect(() => {
    if (!minimapPnlRef.current) return;
    // setTimeout(() => {
    const { left, top, width, height } =
      minimapPnlRef.current.getBoundingClientRect();
    if (isHidden) {
      // minimapDispatch({
      //   type: 'MINIMAP_SIZE_UPDATED',
      //   payload: {
      //     left,
      //     top: window.innerHeight + 0.2 * height,
      //     width,
      //     height,
      //   },
      // });
    } else {
      // minimapDispatch({
      //   type: 'MINIMAP_SIZE_UPDATED',
      //   payload: {
      //     left,
      //     top: window.innerHeight - height - panelSpacer,
      //     width,
      //     height,
      //   },
      // });
    }
    // }, 250);
  }, [isHidden, left, right, top, bottom]); // подумать ещё, при изменениях самой миникарты, ширины и проч.

  // if (!lines.length || !value.turns.length) {
  //   return 'Loading...';
  // }

  // useEffect(() => {
  //   console.log({
  //     lines,
  //     valueTurns: value.turns,
  //   });
  // }, [lines, value.turns]);
  useEffect(() => {
    if (turns.length && uiLines.length) {
      setLines(uiLines);
    }
  }, [uiLines, turns]);

  value.lines = getLinesByTurns(value.turns, lines);
  const style = { transform: `translateY(${isHidden ? '120%' : '0%'})` }; // контролируем стиль из компонента

  return (
    <>
      {!isMinimized && <SVGMiniMap {...value} />}
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
      x: Math.floor(turn.x + turn.width / 2),
      y: Math.floor(turn.y + turn.height / 2),
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
      x1: turnCentersDictionary[line.sourceTurnId].x,
      y1: turnCentersDictionary[line.sourceTurnId].y,
      x2: turnCentersDictionary[line.targetTurnId].x,
      y2: turnCentersDictionary[line.targetTurnId].y,
    });
  }
  return resLines;
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
  position,
  minimapWidth,
  width,
  height,
  viewport,
  turns,
  zeroPoint,
  lines,
  onMapClick,
}) => {
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

  return (
    <>
      <svg
        viewBox={`${position.left} ${position.top} ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: `${minimapWidth}px` }}
        onClick={(e) => onMapClick(e)}
      >
        {/* {!!zeroPoint && (
        <rect
          key={zeroPoint._id}
          x={zeroPoint.x - 20}
          y={zeroPoint.y - 20}
          width={40}
          fill={'red'}
          height={40}
        />
      )} */}
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

            return (
              <rect
                key={turn._id}
                x={turn.x}
                y={turn.y}
                width={turn.width}
                rx={turnRadiusFactored}
                // fill={fill}
                fill="#489BC1"
                height={turn.height}
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
          x={viewport.x - viewportLineWidthCorrection}
          y={viewport.y - viewportLineWidthCorrection}
          width={viewport.width + 2 * viewportLineWidthCorrection}
          height={viewport.height + 2 * viewportLineWidthCorrection}
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
                x={turn.x}
                y={turn.y}
                width={turn.width}
                rx={turnRadiusFactored}
                // fill={fill}
                fill="#489BC1"
                height={turn.height}
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
              x={viewport.x}
              y={viewport.y}
              width={viewport.width}
              height={viewport.height}
            />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};
export default Minimap;

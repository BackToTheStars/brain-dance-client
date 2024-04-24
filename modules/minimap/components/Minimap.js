import { useDispatch, useSelector } from 'react-redux';
import MinimapButtons from './MinimapButtons';
import { PANEL_MINIMAP } from '@/modules/panels/settings';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { changePanelGeometry } from '@/modules/panels/redux/actions';
import { areRectanglesIntersect } from '@/modules/turns/components/helpers/sizeHelper';
import { utils } from '@/modules/game/components/helpers/game';

const BUTTONS_SIZE = 38;
const STANDARD_SQUARE = 60000;
const INNER_PADDING = 12;

const Minimap = () => {
  const id = PANEL_MINIMAP;
  const dispatch = useDispatch();
  const isDisplayed = useSelector((state) => state.panels.d[id].isDisplayed);
  const isMinimized = useSelector((state) => state.panels.d[id].isMinimized);
  const size = useSelector((state) => state.panels.d[id].size);
  const areaRect = useSelector((state) => state.game.areaRect);

  const setMinimapSizePercents = useCallback((size) => {
    dispatch(changePanelGeometry(id, { size }));
  }, []);

  useEffect(() => {
    if (isMinimized) {
      dispatch(
        changePanelGeometry(PANEL_MINIMAP, {
          width: BUTTONS_SIZE,
          height: BUTTONS_SIZE,
        })
      );
    }
  }, [isMinimized]);

  useEffect(() => {
    if (isMinimized) {
      return;
    }
    const minimapSquare = Math.round((STANDARD_SQUARE * size) / 100);
    const minimapK =
      Math.round((areaRect.width * 100) / areaRect.height) / 100;
    const minimapH = Math.round(Math.sqrt(minimapSquare / minimapK));
    const minimapW = Math.round(minimapH * minimapK);
    dispatch(
      changePanelGeometry(PANEL_MINIMAP, {
        width: minimapW + INNER_PADDING * 2,
        height: minimapH + INNER_PADDING * 2 + BUTTONS_SIZE,
      })
    );
  }, [isMinimized, areaRect, size, STANDARD_SQUARE]);

  if (!isDisplayed) {
    return null;
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {isMinimized ? null : <MinimapDataAdapter />}
      </div>
      <MinimapButtons
        isMinimized={isMinimized}
        minimapSizePercents={size}
        setMinimapSizePercents={setMinimapSizePercents}
      />
    </div>
  );
};

const MinimapDataAdapter = () => {
  const width = useSelector((state) => state.panels.d[PANEL_MINIMAP].width);
  const areaRect = useSelector((state) => state.game.areaRect);
  const { mWidth, mHeight } = useMemo(() => {
    const minimapK =
      Math.round((areaRect.width * 100) / areaRect.height) / 100;
    const mWidth = width - 2 * INNER_PADDING;
    const mHeight = Math.round(mWidth / minimapK);
    return {
      mWidth,
      mHeight,
    };
  }, [width, areaRect]);

  const { minimapStyles, wrapperStyles } = useMemo(() => {
    return {
      wrapperStyles: {
        height: `${mHeight + 2 * INNER_PADDING}px`,
      },
      minimapStyles: {
        width: `${mWidth}px`,
        height: `${mHeight}px`,
      },
    };
  }, [mWidth, mHeight]);

  return (
    <div className="flex items-center justify-center" style={wrapperStyles}>
      <div style={minimapStyles}>
        <SVGMiniMap width={mWidth} height={mHeight} />
      </div>
    </div>
  );
};

const SVGMiniMap = memo(({ width, height }) => {
  const areaRect = useSelector((state) => state.game.areaRect);
  const g = useSelector((state) => state.turns.g);
  const gamePosition = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.game.viewport);

  const gTurns = useMemo(() => {
    const gTurns = Object.values(g)
      .filter((turn) => {
        return turn.contentType !== 'zero-point';
      })
      .map((turn) => {
        return {
          _id: turn._id,
          position: turn.position,
          size: turn.size,
        };
      });
    return gTurns;
  }, [g]);

  const k = useMemo(() => {
    return Math.round((areaRect.width * 1000) / width) / 1000;
  }, [width, areaRect]);

  const { sAreaRect, viewBox } = useMemo(() => {
    const sAreaRect = {
      left: Math.round(areaRect.left / k),
      top: Math.round(areaRect.top / k),
      right: Math.round(areaRect.right / k),
      bottom: Math.round(areaRect.bottom / k),
      width: Math.round(areaRect.width / k),
      height: Math.round(areaRect.height / k),
    };
    return {
      sAreaRect,
      viewBox: `${sAreaRect.left} ${sAreaRect.top} ${sAreaRect.width} ${sAreaRect.height}`,
    };
  }, [k, areaRect]);

  const onMapClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const targetX = Math.round((e.clientX - rect.left) * k) + areaRect.left;
    const targetY = Math.round((e.clientY - rect.top) * k) + areaRect.top;
    const currentX = Math.round(gamePosition.x + viewport.width / 2);
    const currentY = Math.round(gamePosition.y + viewport.height / 2);
    utils.moveScene(currentX - targetX, targetY - currentY);
  }, [k, areaRect, gamePosition, viewport]);

  if (!k) {
    return null;
  }

  return (
    <svg
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      onClick={(e) => onMapClick(e)}
    >
      <g
        filter="url(#blurMe)"
        x={sAreaRect.left}
        y={sAreaRect.top}
        width={sAreaRect.width}
        height={sAreaRect.height}
      >
        {gTurns.map((turn) => {
          return <TurnRect key={turn._id} id={turn._id} k={k} />;
        })}
      </g>
      <ViewportRect k={k} />
      <filter id="blurMe">
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation={Math.round((sAreaRect.width * 3) / 1000)}
        />
      </filter>
    </svg>
  );
});

const ViewportRect = memo(({ k }) => {
  const gamePosition = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.game.viewport);
  const g = useSelector((state) => state.turns.g);
  const gTurns = useMemo(() => {
    const gTurns = Object.values(g)
      .filter((turn) => {
        return turn.contentType !== 'zero-point';
      })
      .map((turn) => {
        return {
          _id: turn._id,
          position: turn.position,
          size: turn.size,
        };
      });
    return gTurns;
  }, [g]);
  const gTurnsInsideViewport = useMemo(() => {
    return gTurns.filter((turn) => {
      return areRectanglesIntersect(turn, {
        position: gamePosition,
        size: viewport,
      });
    });
  }, [gTurns, gamePosition, viewport]);

  const sViewport = useMemo(() => {
    return {
      width: Math.round(viewport.width / k),
      height: Math.round(viewport.height / k),
    };
  }, [k, viewport]);
  const sGamePosition = useMemo(() => {
    return {
      x: Math.round(gamePosition.x / k),
      y: Math.round(gamePosition.y / k),
    };
  }, [k, gamePosition]);
  return (
    <>
      <rect
        key="map-focus"
        x={sGamePosition.x}
        y={sGamePosition.y}
        width={sViewport.width}
        height={sViewport.height}
        className="map-focus"
        stroke="#FFFFFF"
        strokeWidth="3"
        fill="transparent"
      />
      {gTurnsInsideViewport.map((turn) => {
        return (
          <TurnRect
            key={turn._id}
            id={turn._id}
            k={k}
            fill="#489BC1"
            clipPath="url(#viewPort)"
          />
        );
      })}
      <defs>
        <clipPath id="viewPort">
          <rect
            x={sGamePosition.x}
            y={sGamePosition.y}
            width={sViewport.width}
            height={sViewport.height}
          />
        </clipPath>
      </defs>
    </>
  );
});

const TurnRect = memo(({ id, k, clipPath, fill = 'blue' }) => {
  const position = useSelector((state) => state.turns.g[id].position);
  const size = useSelector((state) => state.turns.g[id].size);
  const sPosition = useMemo(() => {
    return {
      x: Math.round(position.x / k),
      y: Math.round(position.y / k),
    };
  }, [position, k]);

  const sSize = useMemo(() => {
    return {
      width: Math.round(size.width / k),
      height: Math.round(size.height / k),
    };
  }, [size, k]);

  return (
    <rect
      x={sPosition.x}
      y={sPosition.y}
      width={sSize.width}
      height={sSize.height}
      className="minimap-turn"
      fill={fill}
      clipPath={clipPath}
    />
  );
});

export default Minimap;

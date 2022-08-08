import {
  kBezier,
  lineOffset,
  lineThickness,
  TURN_BORDER_THICKNESS,
} from '@/config/ui';
import {
  SIDE_RIGHT,
  SIDE_LEFT,
  SIDE_TOP,
  SIDE_BOTTOM,
  CURVE_VERTICAL,
  CURVE_HORIZONTAL,
  CURVE_ROMBUS_P_P,
  CURVE_ROMBUS_M_M,
  CURVE_ROMBUS_P_M,
  CURVE_ROMBUS_M_P,
} from './settings';

const getFromToQuoteSettingsX = (source, target) => {
  if (source.left > target.right + lineOffset) {
    return [SIDE_LEFT, SIDE_RIGHT, CURVE_HORIZONTAL];
  }
  if (source.left - lineOffset > target.centerX) {
    if (source.centerY >= target.top && source.centerY <= target.bottom) {
      return [SIDE_LEFT, SIDE_RIGHT, CURVE_HORIZONTAL];
    } else if (source.centerY < target.centerY) {
      return [SIDE_LEFT, SIDE_TOP, CURVE_ROMBUS_M_P];
    } else {
      return [SIDE_LEFT, SIDE_BOTTOM, CURVE_ROMBUS_M_M];
    }
  }
  if (target.centerX < source.right + lineOffset) {
    if (source.centerY >= target.top && source.centerY <= target.bottom) {
      return [SIDE_RIGHT, SIDE_LEFT, CURVE_HORIZONTAL];
    } else if (source.centerY < target.centerY) {
      return [SIDE_BOTTOM, SIDE_TOP, CURVE_VERTICAL];
    } else {
      return [SIDE_TOP, SIDE_BOTTOM, CURVE_VERTICAL];
    }
  }

  if (target.left < source.right + lineOffset) {
    if (source.centerY >= target.top && source.centerY <= target.bottom) {
      return [SIDE_RIGHT, SIDE_LEFT, CURVE_HORIZONTAL];
    } else if (source.centerY < target.centerY) {
      return [SIDE_RIGHT, SIDE_TOP, CURVE_ROMBUS_P_P];
    } else {
      return [SIDE_RIGHT, SIDE_BOTTOM, CURVE_ROMBUS_P_M];
    }
  }
  return [SIDE_RIGHT, SIDE_LEFT, CURVE_HORIZONTAL];
};

const findXY = (coords, side) => {
  // const SIDE_TOP = 'top';
  const settings = {
    [SIDE_TOP]: [coords.centerX, coords.top],
    [SIDE_BOTTOM]: [coords.centerX, coords.bottom],
    [SIDE_LEFT]: [coords.left, coords.centerY],
    [SIDE_RIGHT]: [coords.right, coords.centerY],
  };
  return settings[side];
};

const findBezierXYPairs = ({ x1, y1, x2, y2 }, curveType, k = 0.5) => {
  const width = x2 - x1;
  const height = y2 - y1;

  if (CURVE_HORIZONTAL === curveType) {
    return [x1 + k * width, y1, x2 - k * width, y2];
  }
  if (CURVE_VERTICAL === curveType) {
    return [x1, y1 + k * height, x2, y2 - k * height];
  }
  if (CURVE_ROMBUS_P_P === curveType) {
    return [x1 + k * width, y1, x2, y2 - k * height];
  }
  if (CURVE_ROMBUS_M_M === curveType) {
    return [x1, y1 + k * height, x2 - k * width, y2];
  }
  if (CURVE_ROMBUS_P_M === curveType) {
    return [x1 + k * width, y1, x2, y2 - k * height];
  }
  if (CURVE_ROMBUS_M_P === curveType) {
    return [x1, y1 + k * height, x2 - k * width, y2];
  }
};

const Line = ({
  sourceCoords: prevSourceCoords,
  targetCoords: prevTargetCoords,
  stroke = 'red',
  strokeWidth = lineThickness,
}) => {
  // console.log({ prevSourceCoords });
  const sourceCoords = {
    ...prevSourceCoords,
    right:
      prevSourceCoords.left + prevSourceCoords.width + TURN_BORDER_THICKNESS,
    bottom:
      prevSourceCoords.top + prevSourceCoords.height + TURN_BORDER_THICKNESS,
    centerX: Math.floor(prevSourceCoords.left + prevSourceCoords.width / 2),
    centerY: Math.floor(prevSourceCoords.top + prevSourceCoords.height / 2),
  };
  const targetCoords = {
    ...prevTargetCoords,
    right:
      prevTargetCoords.left + prevTargetCoords.width + TURN_BORDER_THICKNESS,
    bottom:
      prevTargetCoords.top + prevTargetCoords.height + TURN_BORDER_THICKNESS,
    centerX: Math.floor(prevTargetCoords.left + prevTargetCoords.width / 2),
    centerY: Math.floor(prevTargetCoords.top + prevTargetCoords.height / 2),
  };

  const [sourceSide, targetSide, curveType] = getFromToQuoteSettingsX(
    sourceCoords,
    targetCoords
  );

  // ГЛОБАЛЬНЫЕ НАСТРОЙКИ ВНЕШНЕГО ВИДА ЛИНИЙ
  // const k = 0.3; // - константа внешнего вида кривых

  let [x1, y1] = findXY(sourceCoords, sourceSide);
  let [x2, y2] = findXY(targetCoords, targetSide);
  if (x1 > x2) {
    [x1, x2, y1, y2] = [x2, x1, y2, y1];
  }
  const [x1b, y1b, x2b, y2b] = findBezierXYPairs(
    { x1, y1, x2, y2 },
    curveType,
    kBezier
  );

  return (
    <path
      d={`M${x1} ${y1} C ${x1b} ${y1b}, ${x2b} ${y2b}, ${x2} ${y2}`}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  );
};

export default Line;

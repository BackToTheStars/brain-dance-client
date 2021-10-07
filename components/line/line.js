import { lineThickness, lineOffset } from '../сonst';
import { SIDE_RIGHT, SIDE_LEFT, SIDE_TOP, SIDE_BOTTOM } from './settings';

const getFromToQuoteSettingsX = (source, target) => {
  if (source.left > target.right + lineOffset) {
    return [SIDE_LEFT, SIDE_RIGHT];
  }
  if (source.left - lineOffset > target.centerX) {
    if (source.centerY < target.centerY) {
      return [SIDE_LEFT, SIDE_TOP];
    } else {
      return [SIDE_LEFT, SIDE_BOTTOM];
    }
  }
  if (target.centerX < source.right + lineOffset) {
    if (source.centerY < target.centerY) {
      return [SIDE_RIGHT, SIDE_TOP];
    } else {
      return [SIDE_RIGHT, SIDE_BOTTOM];
    }
  }
  return [SIDE_RIGHT, SIDE_LEFT];
};

const Line = ({
  sourceCoords: prevSourceCoords,
  targetCoords: prevTargetCoords,
  stroke = 'red',
  strokeWidth = lineThickness,
}) => {
  const sourceCoords = {
    ...prevSourceCoords,
    right: prevSourceCoords.left + prevSourceCoords.width,
    bottom: prevSourceCoords.top + prevSourceCoords.height,
    centerX: Math.floor(prevSourceCoords.left + prevSourceCoords.width / 2),
    centerY: Math.floor(prevSourceCoords.top + prevSourceCoords.height / 2),
  };
  const targetCoords = {
    ...prevTargetCoords,
    right: prevTargetCoords.left + prevTargetCoords.width,
    bottom: prevTargetCoords.top + prevTargetCoords.height,
    centerX: Math.floor(prevTargetCoords.left + prevTargetCoords.width / 2),
    centerY: Math.floor(prevTargetCoords.top + prevTargetCoords.height / 2),
  };

  const [sourceSide, targetSide] = getFromToQuoteSettingsX(
    sourceCoords,
    targetCoords
  );

  //   const sourceCoords = this.sourceQuote.getCoords();
  //   const targetCoords = this.targetQuote.getCoords();
  const sideBarWidth = 0; // @todo: change the layout
  // $('#classMenu').width(); // + 45;

  // фрагмент 3
  const sourceFirst = sourceCoords.left < targetCoords.left;
  const line = {
    x1: Math.round(
      sourceCoords.left + (sourceFirst ? sourceCoords.width : 0) - sideBarWidth
    ),
    // + (sourceFirst ? 7 : -1), // + 3,
    y1: Math.round(sourceCoords.top + Math.floor(sourceCoords.height / 2)),
    x2: Math.round(
      targetCoords.left + (sourceFirst ? 0 : targetCoords.width) - sideBarWidth
    ),
    // + (sourceFirst ? -1 : 7), // - 5,
    y2: Math.round(targetCoords.top + Math.floor(targetCoords.height / 2)),
  };

  // ГЛОБАЛЬНЫЕ НАСТРОЙКИ ВНЕШНЕГО ВИДА ЛИНИЙ
  const k = 0.3; // - константа внешнего вида кривых

  return (
    <path
      d={`M${line.x1} ${line.y1} C ${line.x1 + k * (line.x2 - line.x1)} ${
        line.y1
      }, ${line.x2 - k * (line.x2 - line.x1)} ${line.y2}, ${line.x2} ${
        line.y2
      }`}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  );
};

export default Line;

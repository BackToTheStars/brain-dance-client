import { lineThickness } from '../сonst';

const Line = ({
  sourceCoords,
  targetCoords,
  stroke = 'red',
  strokeWidth = lineThickness,
}) => {
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

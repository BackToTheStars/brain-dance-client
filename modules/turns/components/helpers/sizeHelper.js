import { widgetSpacer } from '@/config/ui';
import { TurnHelper } from '../../redux/helpers';

export const areRectanglesIntersect = (rect1, rect2) => {
  return (
    rect1.x + rect1.width >= rect2.x &&
    rect1.x <= rect2.x + rect2.width &&
    rect1.y + rect1.height >= rect2.y &&
    rect1.y <= rect2.y + rect2.height
  );
};

export const isTurnInsideRenderArea = (turn, viewport) => {
  return areRectanglesIntersect(TurnHelper.toOldFields(turn), {
    x: viewport.x - viewport.width,
    width: 3 * viewport.width,
    y: viewport.y - viewport.height,
    height: 3 * viewport.height,
  });
};

export const getTurnMinMaxHeight = (widgets, newTurnWidth) => {
  let minWidth = 0;
  let minHeight = 0;
  let maxHeight = 0;
  let minHeightBasic = 0; // все высоты суммарно кроме высоты параграфа
  let desiredHeight = 0;

  const widgetD = {};

  for (let widget of widgets) {
    if (minWidth < widget.minWidthCallback()) {
      minWidth = widget.minWidthCallback();
    }

    widgetD[widget.id] = {
      minHeight: widget.minHeightCallback(newTurnWidth),
      maxHeight: widget.maxHeightCallback(newTurnWidth),
      desiredHeight:
        (widget.desiredHeightCallback &&
          widget.desiredHeightCallback(newTurnWidth)) ||
        0,
    };
  }

  for (let widget of widgets) {
    minHeight = minHeight + widget.minHeightCallback(newTurnWidth);
    maxHeight = maxHeight + widget.maxHeightCallback(newTurnWidth);
    desiredHeight =
      desiredHeight +
        (widget.desiredHeightCallback &&
          widget.desiredHeightCallback(newTurnWidth)) ||
      widget.minHeightCallback(newTurnWidth);

    if (!widget.variableHeight) {
      minHeightBasic = minHeightBasic + widget.minHeightCallback(newTurnWidth);
    }
    // console.log({ desiredHeight });
  }

  // if (!!desiredHeight) desiredHeight = desiredHeight + 2 * widgetSpacer;

  return {
    minHeight,
    maxHeight,
    minWidth,
    desiredHeight,
    maxWidth: Math.max(minWidth, newTurnWidth), // @todo: ограничить ширину
    widgetD,
    minHeightBasic,
  };
};

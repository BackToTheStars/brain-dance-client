import { widgetSpacer } from '@/config/ui';

export const getTurnMinMaxHeight = (widgets, newTurnWidth) => {
  let minWidth = 0;
  let minHeight = 0;
  let maxHeight = 0;
  let minHeightBasic = 0;
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
    console.log(desiredHeight);
  }

  // if (!!desiredHeight) desiredHeight = desiredHeight + 2 * widgetSpacer;

  return {
    minHeight,
    maxHeight,
    minWidth,
    desiredHeight,
    maxWidth: Math.max(minWidth, newTurnWidth), // @todo: ограничить ширину
    widgetD,
  };
};

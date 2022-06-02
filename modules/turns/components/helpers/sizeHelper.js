export const getTurnMinMaxHeight = (widgets, newTurnWidth) => {
  let minWidth = 0;
  let minHeight = 0;
  let maxHeight = 0;
  let minHeightBasic = 0;

  const widgetD = {};

  for (let widget of widgets) {
    if (minWidth < widget.minWidthCallback()) {
      minWidth = widget.minWidthCallback();
    }

    widgetD[widget.id] = {
      minHeight: widget.minHeightCallback(newTurnWidth),
      maxHeight: widget.maxHeightCallback(newTurnWidth),
    };
  }

  for (let widget of widgets) {
    minHeight = minHeight + widget.minHeightCallback(newTurnWidth);
    maxHeight = maxHeight + widget.maxHeightCallback(newTurnWidth);
    if (!widget.variableHeight) {
      minHeightBasic = minHeightBasic + widget.minHeightCallback(newTurnWidth);
    }
  }

  return {
    minHeight,
    maxHeight,
    minWidth,
    maxWidth: Math.max(minWidth, newTurnWidth), // @todo: ограничить ширину
    widgetD,
  };
};

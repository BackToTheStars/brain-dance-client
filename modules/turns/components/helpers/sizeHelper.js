import { PRELOAD_VIEWPORTS_COUNT } from '@/config/ui';

export const isBorderCoincides = (rect, area) => {
  const { position: position1, size: size1 } = rect;
  const { position: position2, size: size2 } = area;

  return (
    position1.x === position2.x ||
    position1.x + size1.width === position2.x + size2.width ||
    position1.y === position2.y ||
    position1.y + size1.height === position2.y + size2.height
  )
}

export const isRectInsideArea = (rect, area) => {
  const { position: position1, size: size1 } = rect;
  const { position: position2, size: size2 } = area;

  return (
    position1.x >= position2.x &&
    position1.x + size1.width <= position2.x + size2.width &&
    position1.y >= position2.y &&
    position1.y + size1.height <= position2.y + size2.height
  );
}

export const areRectanglesIntersect = (rect1, rect2) => {
  const { position: position1, size: size1 } = rect1;
  const { position: position2, size: size2 } = rect2;
  return (
    position1.x + size1.width >= position2.x &&
    position1.x <= position2.x + size2.width &&
    position1.y + size1.height >= position2.y &&
    position1.y <= position2.y + size2.height
  );
};

export const isTurnInsideRenderArea = (turn, viewport) => {
  return areRectanglesIntersect(turn, {
    position: {
      x: viewport.position.x - viewport.size.width,
      y: viewport.position.y - viewport.size.height,
    },
    size: {
      width: PRELOAD_VIEWPORTS_COUNT * viewport.size.width,
      height: PRELOAD_VIEWPORTS_COUNT * viewport.size.height,
    },
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

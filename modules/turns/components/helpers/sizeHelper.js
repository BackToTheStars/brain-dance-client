import { PRELOAD_VIEWPORTS_COUNT } from '@/config/ui';

export const isBorderCoincides = (rect, area) => {
  const { position: position1, size: size1 } = rect;
  const { position: position2, size: size2 } = area;

  return (
    position1.x === position2.x ||
    position1.x + size1.width === position2.x + size2.width ||
    position1.y === position2.y ||
    position1.y + size1.height === position2.y + size2.height
  );
};

export const isRectInsideArea = (rect, area) => {
  const { position: position1, size: size1 } = rect;
  const { position: position2, size: size2 } = area;

  return (
    position1.x >= position2.x &&
    position1.x + size1.width <= position2.x + size2.width &&
    position1.y >= position2.y &&
    position1.y + size1.height <= position2.y + size2.height
  );
};

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

export const getTurnMinMaxHeight = (widgets, newTurnWidth, spacersHeight) => {
  let minWidth = 0;
  let minHeight = spacersHeight;
  let maxHeight = spacersHeight;

  for (let widget of widgets) {
    if (minWidth < widget.minWidthCallback()) {
      minWidth = widget.minWidthCallback();
    }
  }

  for (let widget of widgets) {
    minHeight = minHeight + widget.minHeightCallback(newTurnWidth);
    maxHeight = maxHeight + widget.maxHeightCallback(newTurnWidth);
  }

  return {
    minHeight,
    maxHeight,
    minWidth,
    maxWidth: Math.max(minWidth, newTurnWidth),
  };
};

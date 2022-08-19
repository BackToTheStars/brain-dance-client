export const getScreenRect = (turnObjects) => {
  let left = turnObjects[0]?.x || 0,
    right = turnObjects[0]?.x + turnObjects[0]?.width || 0,
    top = turnObjects[0]?.y || 0,
    bottom = turnObjects[0]?.y + turnObjects[0]?.height || 0,
    zeroX = 0,
    zeroY = 0;
  const turns = [];
  for (let turnObject of turnObjects) {
    const { x, y, height, width, _id, contentType } = turnObject; // собирает все ходы с экрана
    turns.push({ x, y, height, width, _id });
    if (contentType === 'zero-point') {
      zeroX = x;
      zeroY = y;
    } else {
      if (left > x) {
        left = x;
      }

      if (top > y) {
        top = y;
      }

      if (right < x + width) {
        right = x + width;
      }

      if (bottom < y + height) {
        bottom = y + height;
      }
    }
  }

  return {
    left,
    right,
    top,
    bottom,
    zeroX,
    zeroY,
    turns,
  };
};

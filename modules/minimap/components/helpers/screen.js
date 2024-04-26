export const getBoundingAreaRect = (turnObjects) => {
  let left = turnObjects[0]?.position.x || 0;
  let right = turnObjects[0]?.position.x + turnObjects[0]?.size.width || 0;
  let top = turnObjects[0]?.position.y || 0;
  let bottom = turnObjects[0]?.position.y + turnObjects[0]?.size.height || 0;

  for (let turnObject of turnObjects) {
    const {
      position: { x, y },
      size: { height, width },
    } = turnObject;
    if (left > x) {
      left = x;
    }
    if (right < x + width) {
      right = x + width;
    }
    if (top > y) {
      top = y;
    }
    if (bottom < y + height) {
      bottom = y + height;
    }
  }

  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
  }
}

// Under CSS zoom on #game-box, getBoundingClientRect and the mouse are screen
// px, while offsets, scrollTop, inline styles and the stored geometry are
// canvas px. The zoom comes from the store: WebKit has no currentCSSZoom.

// jQuery UI starts a drag from a scaled getBoundingClientRect and adds the
// mouse travel 1:1, so under zoom the travel is rebuilt from the mouse. Null
// at 1, where jQuery is right.
export const mouseTravel = (zoom, from) =>
  zoom === 1
    ? null
    : (event) => ({
        x: (event.pageX - from.pageX) / zoom,
        y: (event.pageY - from.pageY) / zoom,
      });

export const relativeRect = (el, origin, zoom = 1) => {
  const rect = el.getBoundingClientRect();
  const base = origin.getBoundingClientRect();
  return {
    left: (rect.left - base.left) / zoom,
    top: (rect.top - base.top) / zoom,
    width: rect.width / zoom,
    height: rect.height / zoom,
  };
};

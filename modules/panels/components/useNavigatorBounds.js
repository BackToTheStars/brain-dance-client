import { useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PANEL_NAVIGATOR } from '@/config/panel';
import { changePanelGeometry } from '../redux/actions';
import { fitPanelPlace } from '@/modules/presence/panelView';

export function useNavigatorBounds(ref) {
  const bounds = useSelector(state => state.panels.d[PANEL_NAVIGATOR].bounds);
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    const box = ref.current.parentElement;
    const el = $(box);
    function fit() {
      const screen = { width: window.innerWidth, height: window.innerHeight };
      const maxWidth = Math.max(1, Math.min(960, screen.width - 24));
      const maxHeight = Math.max(1, screen.height - 24);
      const size = {
        width: Math.min(maxWidth, Math.max(320, bounds?.width ?? 480)),
        height: Math.min(maxHeight, Math.max(240, bounds?.height ?? 440)),
      };
      const place = bounds ?? { left: screen.width - size.width - 12, top: 12 };
      el.css({ ...size, ...fitPanelPlace(place, size, screen) });
      el.resizable('option', {
        minWidth: Math.min(320, maxWidth), minHeight: Math.min(240, maxHeight), maxWidth, maxHeight,
      });
    }
    function save() {
      const { left, top, width, height } = box.getBoundingClientRect();
      dispatch(changePanelGeometry(PANEL_NAVIGATOR, { bounds: { left, top, width, height } }));
    }
    el.draggable({ handle: '.navigator-header', containment: 'window', stop: save });
    el.resizable({ handles: 'n,e,s,w,se,sw', stop: save });
    fit();
    window.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
      el.resizable('destroy').draggable('destroy');
    };
  }, [bounds, dispatch, ref]);
}

export function freeCenter(box, w, h) {
  const regions = [
    [0, 0, box.left, h], [box.right, 0, w - box.right, h],
    [0, 0, w, box.top], [0, box.bottom, w, h - box.bottom],
  ];
  const [x, y, width, height] = regions.reduce((a, b) => a[2] * a[3] >= b[2] * b[3] ? a : b);
  return { x: x + width / 2, y: y + height / 2 };
}

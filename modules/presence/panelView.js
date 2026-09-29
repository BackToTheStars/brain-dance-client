// Вид и место панели присутствия помнятся на пользователя, а не на игру.
// Только на клиенте: ходит в localStorage.

import { GRID_CELL_X } from '@/config/ui';
import { getStore, lsUpdateLayoutSettings } from '@/modules/settings/redux/requests';
import { snapRound } from '@/modules/turns/components/helpers/grid';

// Не выбранный ни разу вид — свёрнутый.
export const readPresencePanelCollapsed = () =>
  typeof window === 'undefined' ||
  getStore().layoutSettings?.presencePanelCollapsed !== false;

export const savePresencePanelCollapsed = (collapsed) =>
  lsUpdateLayoutSettings({ presencePanelCollapsed: !!collapsed });

// Панель лежит вне холста, поэтому сетка экранная: GRID_CELL_X от левого верхнего
// угла окна. Место прижимается к сетке и к окну — панель целиком видна.
export const fitPanelPlace = (place, size, screen) => {
  const fit = (value, room) =>
    Math.max(
      0,
      Math.min(
        snapRound(value, GRID_CELL_X),
        Math.floor(room / GRID_CELL_X) * GRID_CELL_X,
      ),
    );
  return {
    left: fit(place.left, screen.width - size.width),
    top: fit(place.top, screen.height - size.height),
  };
};

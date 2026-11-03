// Открыть форму правки хода и подвинуть холст так, чтобы карточка встала в центр
// свободной области слева от панели редактора. Панель лежит вне #game-box, её ширина —
// экранные px, в координату холста идёт делением на масштаб.

import { PANEL_ADD_EDIT_TURN } from '@/config/panel';
import { centerViewportAtPosition } from '@/modules/game/game-redux/actions';
import { getEditorPanelWidth } from '@/modules/panels/helpers/editorPanel';
import { togglePanel } from '@/modules/panels/redux/actions';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useOpenTurnForm = (turnId) => {
  const dispatch = useDispatch();
  const turnGeometry = useSelector((state) => state.turns.g[turnId]);
  const editorPanelWidth = useSelector(getEditorPanelWidth);
  const zoom = useSelector((state) => state.game.zoom);

  return useCallback(() => {
    dispatch(
      togglePanel({
        type: PANEL_ADD_EDIT_TURN,
        open: true,
        params: { editTurnId: turnId },
      }),
    );
    dispatch(
      centerViewportAtPosition({
        x:
          turnGeometry.position.x +
          Math.floor(turnGeometry.size.width / 2) +
          Math.round(editorPanelWidth / 2 / zoom),
        y: turnGeometry.position.y + Math.floor(turnGeometry.size.height / 2),
      }),
    );
  }, [turnId, turnGeometry, editorPanelWidth, zoom]);
};

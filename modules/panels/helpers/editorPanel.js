import { panelSpacer } from '@/config/ui';
import {
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_MIN,
  EDITOR_PANEL_DEFAULT_WIDTH,
  EDITOR_PANEL_MIN_WIDTH,
  PANEL_ADD_EDIT_TURN,
} from '@/config/panel';
import {
  getStore,
  lsUpdateLayoutSettings,
} from '@/modules/settings/redux/requests';

// Настройки панели редактора, которые помнятся на пользователя, а не на игру: ширина
// и размер шрифта в userSettings.layoutSettings. Только на клиенте — ходит в localStorage.

// Максимум ширины — окно минус два отступа панелей, тот же clamp, что max-width
// в panels.scss. wrapper — тот, за кем следит ResizeObserver сплита.
export const getEditorPanelMaxWidth = (wrapper = document.documentElement) =>
  wrapper.clientWidth - 2 * panelSpacer;

export const clampEditorPanelWidth = (value, max = getEditorPanelMaxWidth()) => {
  let width = Number.isFinite(value)
    ? Math.round(value)
    : EDITOR_PANEL_DEFAULT_WIDTH;
  if (width > max) width = max;
  if (width < EDITOR_PANEL_MIN_WIDTH) width = EDITOR_PANEL_MIN_WIDTH;
  return width;
};

export const readEditorPanelWidth = () =>
  clampEditorPanelWidth(getStore().layoutSettings?.editorPanelWidth);

export const saveEditorPanelWidth = (width) =>
  lsUpdateLayoutSettings({ editorPanelWidth: width });

export const clampEditorFontSize = (value) => {
  const size = Number.isFinite(value) ? value : EDITOR_FONT_SIZE_DEFAULT;
  return Math.min(Math.max(size, EDITOR_FONT_SIZE_MIN), EDITOR_FONT_SIZE_MAX);
};

export const readEditorFontSize = () =>
  clampEditorFontSize(getStore().layoutSettings?.editorFontSize);

export const saveEditorFontSize = (size) =>
  lsUpdateLayoutSettings({ editorFontSize: size });

// Фактическая ширина панели из стейта числом (UIPanel пишет число как px). Если в
// стейт попала старая форма «функция → строка», считаем дефолт.
export const getEditorPanelWidth = (state) => {
  const { width } = state.panels.d[PANEL_ADD_EDIT_TURN];
  return typeof width === 'number' ? width : EDITOR_PANEL_DEFAULT_WIDTH;
};

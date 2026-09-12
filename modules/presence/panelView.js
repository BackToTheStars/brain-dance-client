// Свёрнутый вид панели присутствия помнится на пользователя, а не на игру — в
// userSettings.layoutSettings, рядом с шириной и шрифтом панели редактора
// (modules/panels/helpers/editorPanel.js). Только на клиенте: ходит в localStorage.

import { getStore, lsUpdateLayoutSettings } from '@/modules/settings/redux/requests';

export const readPresencePanelCollapsed = () =>
  typeof window !== 'undefined' &&
  getStore().layoutSettings?.presencePanelCollapsed === true;

export const savePresencePanelCollapsed = (collapsed) =>
  lsUpdateLayoutSettings({ presencePanelCollapsed: !!collapsed });

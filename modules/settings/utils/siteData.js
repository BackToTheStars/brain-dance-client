// Ключи localStorage с данными об играх этого браузера; вход в админку сюда не входит.
const KEY_PREFIXES = ['game_', 'g_settings_', 'turn_'];
const BUFFER_KEYS = ['timeStamps', 'savedLinesToPaste'];

export const siteDataKeys = (keys, settingsKey) =>
  keys.filter(
    (key) =>
      key === settingsKey ||
      BUFFER_KEYS.includes(key) ||
      KEY_PREFIXES.some((prefix) => key.startsWith(prefix)),
  );

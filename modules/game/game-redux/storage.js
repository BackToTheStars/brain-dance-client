import { parseStoredObject } from '@/modules/settings/redux/requests';

// GAME SETTINGS
const GAME_SETTINGS_PREFIX = 'g_settings_';

// хранение информации
// позиции вьюпорта
// настройки панелей
// кодов игры ?

const defaultGameSettings = {
  position: {
    x: 0,
    y: 0,
  },
  panels: {},
};

const getGameSettingsKey = (hash) => `${GAME_SETTINGS_PREFIX}${hash}`;

// создание новых настроек
const createNewGameSettings = (hash) => {
  const key = getGameSettingsKey(hash);
  localStorage.setItem(key, JSON.stringify(defaultGameSettings));
  return defaultGameSettings;
};

// получение текущих настроек; испорченные читаются умолчаниями, их заменит первая запись
export const getGameSettings = (hash) => {
  const key = getGameSettingsKey(hash);
  const str = localStorage.getItem(key);
  if (!str) {
    return createNewGameSettings(hash);
  }
  // @todo: при необходимости произвести валидацию и обновление
  return parseStoredObject(str) || defaultGameSettings;
};

// сброс настроек
export const resetGameSettings = (hash) => {
  return createNewGameSettings(hash);
};

// обновление части настроек
export const updateGameSettings = (hash, path, settings) => {
  const currentSettings = getGameSettings(hash);
  const newSettings = {
    ...currentSettings,
    [path]: settings,
  };
  const key = getGameSettingsKey(hash);
  localStorage.setItem(key, JSON.stringify(newSettings));
  return newSettings;
};

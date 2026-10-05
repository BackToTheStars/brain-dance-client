export const settingsStorageKey =
  process.env.NEXT_PUBLIC_SETTINGS_STORAGE_KEY || 'userSettings';
const VERSION = '0.0.1';

/* LOCAL STORAGE */
const emptyStore = () => ({
  version: VERSION,
  games: [],
  settings: {},
  layoutSettings: {},
  textSettings: {},
});

// создание пустого стора
const createStore = () => {
  const store = emptyStore();
  localStorage.setItem(settingsStorageKey, JSON.stringify(store));
  return store;
};

export const isStoreValid = (store) => {
  if (store.version !== VERSION) {
    return [
      false,
      `Wrong store version. Expected ${VERSION}, got ${store.version}`,
    ];
  }
  return [true];
};

// Объект из хранилища; испорченное значение — null, как отсутствующее.
export const parseStoredObject = (str) => {
  try {
    const value = JSON.parse(str);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
};

// Испорченный стор читается пустым, но чтение его не затирает (/lobby-moved только читает):
// заменит первая запись.
export const getStore = () => {
  const str = localStorage.getItem(settingsStorageKey) || '';
  if (!str) return createStore();
  return parseStoredObject(str) || emptyStore();
};

// обновление стора
const updateStore = (field, value) => {
  const store = getStore();
  const newStore = {
    ...store,
    [field]: value,
  };
  localStorage.setItem(settingsStorageKey, JSON.stringify(newStore));
};

// обновление игр
export const lsUpdateGames = (games) => {
  updateStore('games', games);
};

// Слияние, а не замена: лобби пишет свои два ключа целиком, панель редактора — свои,
// и без слияния заход на «/» стирал чужие.
export const lsUpdateLayoutSettings = (settings) => {
  const { layoutSettings = {} } = getStore();
  updateStore('layoutSettings', { ...layoutSettings, ...settings });
};

export const lsRemoveLayoutSettings = (keys) => {
  const { layoutSettings = {} } = getStore();
  const rest = { ...layoutSettings };
  for (const key of keys) delete rest[key];
  updateStore('layoutSettings', rest);
};

export const lsUpdateTextSettings = (settings) => {
  updateStore('textSettings', settings);
};

// удаление данных из стора
export const clearStore = () => {
  localStorage.removeItem(settingsStorageKey);
  return createStore();
};

// работа с настройками

// экспорт / импорт

/* FETCHING */
export const getCodesString = (pinned = false) => {
  const ls = getStore();
  return ls.games
    .map((g) => {
      const { hash, codes } = g;
      // const code = codes.find((c) => c.active)?.code;
      if (pinned) {
        const isActive = codes.find((c) => c.active)?.code;
        if (!isActive) {
          return null;
        }
      }
      const code = codes[0]?.code;
      if (!code) {
        return null;
      }
      return `${hash}:${code}`;
    })
    .filter((a) => !!a)
    .join(',');
};
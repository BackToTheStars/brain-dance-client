const settingsStorageKey =
  process.env.NEXT_PUBLIC_SETTINGS_STORAGE_KEY || 'userSettings';
const VERSION = '0.0.1';

/* LOCAL STORAGE */
// создание пустого стора
const createStore = () => {
  const store = {
    version: VERSION,
    games: [],
    settings: {},
    layoutSettings: {},
    textSettings: {},
  };
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

// получение данных о сторе
export const getStore = () => {
  const str = localStorage.getItem(settingsStorageKey) || '';
  if (!str) {
    return createStore();
  }
  return JSON.parse(str);
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

export const lsUpdateLayoutSettings = (settings) => {
  updateStore('layoutSettings', settings);
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
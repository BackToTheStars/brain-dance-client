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
  };
  localStorage.setItem(settingsStorageKey, JSON.stringify(store));
  return store;
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

// удаление данных из стора

// работа с настройками

// экспорт / импорт

/* FETCHING */
export const getCodesString = () => {
  const ls = getStore();
  return ls.games
    .map((g) => {
      const { hash, codes } = g;
      const code = codes.reduce((acc, c) => (acc.role > c.role ? acc : c), {
        role: -1,
      }).code;
      return `${hash}:${code}`;
    })
    .join(',');
};


const settingsStorageKey = process.env.NEXT_PUBLIC_SETTINGS_STORAGE_KEY || 'userSettings';
const VERSION = '0.0.1'

// создание пустого стора
const createStore = () => {
  const store = {
    version: VERSION,
    games: [],
    settings: {},
  }
  localStorage.setItem(settingsStorageKey, JSON.stringify(store));
}

// получение данных о сторе
const getStore = () => {
  const str = localStorage.getItem(settingsStorageKey) || '';
  if (!str) { return createStore() };
  return JSON.parse(str);
}

// удаление данных из стора

// добавить игру
const addGame = ({ hash, nickname}) => {

}

const codeLoginRequest = () => {

}

// удалить игру

// работа с настройками

// экспорт / импорт
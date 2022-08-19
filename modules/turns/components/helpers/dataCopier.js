export const dataCopy = (data) => {
  // ECMA script modules, подключена последняя версия через Babel
  return JSON.parse(JSON.stringify(data));
  // если скопировать {...data} то скопируется только верхний уровень, ссылки останутся на прежние объекты
};

export const fieldRemover = (object, fieldsToKeep) => {
  // работает со старой ссылкой на тот же объект
  // Object.keys(object)
  // object.hasOwnProperty()
  for (let key in object) {
    if (fieldsToKeep.indexOf(key) === -1) {
      delete object[key];
    }
  }
};

export const saveTurnInBuffer = ({ copiedTurn, copiedLines }) => {
  const { timeStamp } = addTimeStamp();
  saveIntoLocalStorage(
    { ...copiedTurn, expires: getExpirationTime() },
    `turn_${timeStamp}`
  );
  addLinesToStorage(copiedLines);
  return timeStamp;
};

// -------------------

const getExpirationTime = () => {
  return Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60; // + неделя, вынести в config
};

const saveIntoLocalStorage = (value, field) => {
  localStorage.setItem(field, JSON.stringify(value));
};

const loadFromLocalStorage = (field) => {
  // может быть вызвана на стороне Server Side rendering SSR
  return localStorage.getItem(field)
    ? JSON.parse(localStorage.getItem(field))
    : null;
};

const removeFromLocalStorage = (field) => {
  localStorage.removeItem(field);
};

export const getLinesNotExpired = () => {
  const lines = loadFromLocalStorage('savedLinesToPaste') || {};
  const linesNotExpired = {};
  for (const lineKey in lines) {
    if (lines[lineKey].expires > new Date().getTime() / 1000) {
      linesNotExpired[lineKey] = lines[lineKey];
    }
  }
  if (Object.keys(linesNotExpired).length < Object.keys(lines).length)
    saveIntoLocalStorage(linesNotExpired, 'savedLinesToPaste');
  return linesNotExpired;
};

export const getTurnsFromBuffer = () => {
  const timeStamps = loadFromLocalStorage('timeStamps') || [];
  return timeStamps.map((timeStamp) => ({
    ...loadFromLocalStorage(`turn_${timeStamp}`),
    timeStamp,
  }));
};

export const getTurnFromBufferAndRemove = (timeStamp) => {
  const res = loadFromLocalStorage(`turn_${timeStamp}`);
  removeFromLocalStorage(`turn_${timeStamp}`);
  let timeStamps = loadFromLocalStorage('timeStamps') || [];
  timeStamps = timeStamps.filter((item) => item !== timeStamp);
  saveIntoLocalStorage(timeStamps, 'timeStamps');
  setTimeStamps(timeStamps);
  return res;
};

export const getTimestampsNotExpired = () => {
  const timeStamps = loadFromLocalStorage('timeStamps') || [];
  const turns = getTurnsFromBuffer();
  const timeStampsNotExpired = turns
    .filter((turn) => {
      if (turn.expires > new Date().getTime() / 1000) return turn;
      getTurnFromBufferAndRemove(turn.timeStamp);
    })
    .map((turn) => turn.timeStamp);
  return timeStampsNotExpired;
};

// const [savedLinesToPaste, setSavedLinesToPaste] = useState(
//   typeof window !== 'undefined' ? getLinesNotExpired() || {} : {}
// );

let savedLinesToPaste = [];
const setSavedLinesToPaste = (newLines) => {
  savedLinesToPaste = newLines;
};

let timeStamps = [];
const setTimeStamps = (newTimeStamps) => {
  timeStamps = newTimeStamps;
};
export const getTimeStamps = () => timeStamps; // @todo: проверить, нужна ли функция

// const [timeStamps, setTimeStamps] = useState([]);

const addTimeStamp = () => {
  const timeStamp = new Date().getTime(); // значение в мс после 1 января 1970 года
  const timeStamps = loadFromLocalStorage('timeStamps') || [];
  timeStamps.push(timeStamp);
  saveIntoLocalStorage(timeStamps, 'timeStamps');
  setTimeStamps(timeStamps);
  return { timeStamp, timeStamps };
};

const addLinesToStorage = (octopusLines) => {
  const lines = { ...savedLinesToPaste };
  for (let line of octopusLines) {
    const { sourceTurnId, sourceMarker, targetTurnId, targetMarker } = line;
    // @learn: of для массива, in для объекта по ключам, Object.keys и Object.values
    // создать lineKey
    const lineKey = `${sourceTurnId}_${sourceMarker}_${targetTurnId}_${targetMarker}`;
    // добавить по этому ключу новую запись с expires
    lines[lineKey] = {
      ...line,
      expires: getExpirationTime(),
    };
  }
  // сохранить в localStorage, обновить state
  saveIntoLocalStorage(lines, 'savedLinesToPaste');
  setSavedLinesToPaste(lines);
};

// useEffect(() => {
//   setTimeStamps(getTimestampsNotExpired());
// }, []); // выполнится после первого рендера

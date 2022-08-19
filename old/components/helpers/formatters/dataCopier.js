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

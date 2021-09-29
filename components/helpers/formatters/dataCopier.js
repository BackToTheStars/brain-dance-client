export const dataCopy = (data) => {
  // ECMA script modules, подключена последняя версия через Babel
  return JSON.parse(JSON.stringify(data));
  // если скопировать {...data} то скопируется только верхний уровень, ссылки останутся на прежние объекты
};

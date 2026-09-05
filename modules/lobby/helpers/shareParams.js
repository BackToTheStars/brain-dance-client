// Хвост адреса игры: ход из ссылки «поделиться» (`?turn=`) и экскурсия из
// ссылки-приглашения (`?tour=`). Оба параметра переживают вход в игру — диалог
// роли и ника, вход по коду, редирект кода на хеш — и оба могут быть в адресе
// одновременно, поэтому собираются одной функцией: пять мест, которые их
// передают дальше, иначе расходятся и параметр теряется на одном из них.
//
// Файл ничего не импортирует — его безопасно звать откуда угодно.

const tail = ({ focusTurnId = null, tourId = null } = {}) => {
  const params = new URLSearchParams();
  if (focusTurnId) params.set('turn', focusTurnId);
  if (tourId) params.set('tour', tourId);
  return params.toString();
};

// Диалог входа: `hash` здесь — либо хеш игры, либо код доступа из ссылки лобби,
// поэтому параметры добавляются к уже имеющемуся `?hash=`.
export const gameEntryUrl = (hash, share) => {
  const query = tail(share);
  return `/game?hash=${hash}${query ? `&${query}` : ''}`;
};

// Сам холст.
export const gameViewUrl = (hash, share) => {
  const query = tail(share);
  return `/game/view/${hash}${query ? `?${query}` : ''}`;
};

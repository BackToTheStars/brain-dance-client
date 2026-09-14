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

// Диалог входа по адресу игры.
export const gameEntryUrl = (hash, share) => {
  const query = tail(share);
  return `/game?hash=${hash}${query ? `&${query}` : ''}`;
};

// Вход по коду доступа: код ходит только в `?code=`, адрес — только в `?hash=`.
export const gameCodeUrl = (code, share) => {
  const query = tail(share);
  return `/game?code=${encodeURIComponent(code)}${query ? `&${query}` : ''}`;
};

// Сам холст.
export const gameViewUrl = (hash, share) => {
  const query = tail(share);
  return `/game/view/${hash}${query ? `?${query}` : ''}`;
};

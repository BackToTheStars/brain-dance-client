// Актуальность асинхронных операций формы хода. Редакция — это открытая форма
// вместе с правимым в ней ходом: смена хода и закрытие панели делают прежнюю
// редакцию недействительной, и начатый в ней ответ уже ничего не патчит.
// Операция берёт token() на старте и сверяет его isCurrent() после ожидания.
const NO_TURN = Symbol('no turn');

export const createFormEdition = () => {
  let key = NO_TURN;
  let id = 0;
  let closed = false;

  return {
    open: (nextKey) => {
      if (nextKey === key) return;
      key = nextKey;
      id += 1;
    },
    close: () => {
      closed = true;
    },
    token: () => (closed ? 0 : id),
    isCurrent: (token) => !closed && !!token && token === id,
  };
};

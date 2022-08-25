export const getInitialPanels = (panels) => {
  // @todo:
  // обойти panels
  // замиксовать с LocalStorage
};

export const setInitialPanels = (d) => {
  // получить dict
  // получить его новые поля
  // сохранить новый d в LocalStorage
};

export const saveIntoLocalStorage = (value, field) => {
  localStorage.setItem(field, JSON.stringify(value));
};

export const loadFromLocalStorage = (field) => {
  // может быть вызвана на стороне Server Side rendering SSR
  return localStorage.getItem(field)
    ? JSON.parse(localStorage.getItem(field))
    : null;
};

export const removeFromLocalStorage = (field) => {
  localStorage.removeItem(field);
};

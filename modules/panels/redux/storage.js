const localStorageKey = 'panels';

export const getInitialPanels = (panels) => {
  // @todo:
  // обойти panels
  // замиксовать с LocalStorage
  const fields = loadFromLocalStorage(localStorageKey);
  console.log(panels);
  return panels.map((panel) => {
    if (!fields[panel.type]) {
      return panel;
    }
    return { ...panel, ...fields[panel.type] };
  });
};

export const setInitialPanels = (d) => {
  // получить dict
  // получить его новые поля
  // сохранить новый d в LocalStorage
  const fields = {};
  for (let panel of Object.values(d)) {
    if (!!panel && !!panel.fieldsToSave) {
      fields[panel.type] = {};
      for (let field of panel.fieldsToSave) {
        fields[panel.type][field] = panel[field];
      }
    }
  }
  console.log(fields);
  saveIntoLocalStorage(fields, localStorageKey);
};

export const saveIntoLocalStorage = (value, field) => {
  localStorage.setItem(field, JSON.stringify(value));
};

export const loadFromLocalStorage = (field) => {
  // может быть вызвана на стороне Server Side rendering SSR
  if (typeof window === 'undefined') return {};
  return localStorage.getItem(field)
    ? JSON.parse(localStorage.getItem(field))
    : {};
};

export const removeFromLocalStorage = (field) => {
  localStorage.removeItem(field);
};

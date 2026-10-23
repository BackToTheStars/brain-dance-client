// Файл ничего не импортирует: его зовут и страница входа, и диалог.

// Код выбранной в списке роли: код из ссылки, если роль его, иначе сохранённый в userSettings.
export const codeForRole = (role, linkCode, myCodes = []) =>
  linkCode && Number(linkCode.role) === Number(role)
    ? linkCode
    : myCodes.find((c) => Number(c.role) === Number(role));

// Свежая запись другой роли, чем у кода из ссылки: роль выбирает диалог, токен записи не годится.
export const linkRoleDiffers = (record, linkCode) =>
  !!record?.info && !!linkCode && Number(record.info.role) !== Number(linkCode.role);

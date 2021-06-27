import { createContext, useContext } from 'react';

const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  // создание компонента-обёртки

  const value = {
    defaultClasses: [
      // {
      //   id: 1,
      //   title: 'Empty Class',
      //   name: 'empty-class',
      //   subClasses: [
      //     {
      //       id: 5,
      //       title: 'Special Class',
      //       name: 'special-class', // для поиска и идентификации класса по дереву
      //       subClasses: [],
      //     },
      //   ],
      // },
    ],
  };

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
};

export const useClassContext = () => useContext(ClassContext);

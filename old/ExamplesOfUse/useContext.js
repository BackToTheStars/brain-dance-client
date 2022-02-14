// Создание нового контекста

import { createContext, useContext } from 'react';

const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  const value = {};

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
};

export const useClassContext = () => useContext(ClassContext);


//
// Использование контекста

const Comp1 = () => {
  const {} = useClassContext();
};

const Panel = () => {
  return (
    <>
      <ClassProvider>
        <Comp1 />
        <Comp1 />
        <Comp1 />
      </ClassProvider>
    </>
  );
};

import { useState, useContext, createContext } from 'react';

export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const showConfirmDialog = ({ text, okCallback }) => {
    if (confirm(text)) {
      okCallback();
    }
  };

  const value = {
    showConfirmDialog,
  };

  return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};

export const useMainContext = () => useContext(MainContext);

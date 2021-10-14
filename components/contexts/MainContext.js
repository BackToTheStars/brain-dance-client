import { useState, useContext, createContext } from 'react';

export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  //
  const [activeWidget, setActiveWidget] = useState(null);

  const showConfirmDialog = ({ text, okCallback }) => {
    if (confirm(text)) {
      okCallback();
    }
  };

  const makeWidgetActive = (turnId, widgetType, widgetId) => {
    setActiveWidget({ turnId, widgetType, widgetId });
  };

  const value = {
    showConfirmDialog,
    activeWidget,
    makeWidgetActive,
  };

  return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};

export const useMainContext = () => useContext(MainContext);

import { useState, useContext, useReducer, createContext } from 'react';

export const UI_Context = createContext();
const initialState = {
  classesPanelIsHidden: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'CLASS_PANEL_SET':
      return { classesPanelIsHidden: action.payload };
    default:
      throw new Error();
  }
};

export const UI_Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [classesPanelIsHidden, setClassesPanelIsHidden] = useState(true);
  const [gameInfoPanelIsHidden, setGameInfoPanelIsHidden] = useState(true);

  return (
    <UI_Context.Provider
      value={{
        // classesPanelIsHidden,
        // setClassesPanelIsHidden,

        gameInfoPanelIsHidden,
        setGameInfoPanelIsHidden,

        state,
        dispatch,
      }}
    >
      {children}
    </UI_Context.Provider>
  );
};

export const useUiContext = () => useContext(UI_Context);

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

const minimapInitialState = {
  isHidden: false, // true

  initLeft: 0,
  initTop: 0,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
};

const minimapReducer = (state, action) => {
  switch (action.type) {
    case 'MAP_INIT': {
      const { left, top } = action.payload;
      return {
        ...state,
        initLeft: left,
        initTop: top,
        ...action.payload,
      };
    }
    case 'VIEWPORT_MOVED_ON_FIELD': {
      return {
        ...state,
        ...action.payload,
        // left: action.payload.left,
        // top: action.payload.top,
        // bottom: action.payload.bottom,
        // right: action.payload.right,
      };
    }
    case 'MINIMAP_SHOW_HIDE': {
      return {
        ...state,
        isHidden: !state.isHidden,
      };
    }
    default: {
      throw new Error(`unknown type of minimapReducer "${action.type}"`);
    }
  }
};

export const UI_Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [classesPanelIsHidden, setClassesPanelIsHidden] = useState(true);
  const [gameInfoPanelIsHidden, setGameInfoPanelIsHidden] = useState(true);

  const [minimapState, minimapDispatch] = useReducer(
    minimapReducer,
    minimapInitialState
  );

  return (
    <UI_Context.Provider
      value={{
        // classesPanelIsHidden,
        // setClassesPanelIsHidden,

        gameInfoPanelIsHidden,
        setGameInfoPanelIsHidden,

        state,
        dispatch,

        minimapState,
        minimapDispatch,
      }}
    >
      {children}
    </UI_Context.Provider>
  );
};

export const useUiContext = () => useContext(UI_Context);

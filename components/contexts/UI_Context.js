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
  initRight: 0,
  initBottom: 0,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  initZeroX: 0,
  initZeroY: 0,
  zeroX: 0,
  zeroY: 0,
};

const minimapReducer = (state, action) => {
  switch (action.type) {
    case 'MAP_INIT': {
      const { left, top, right, bottom } = action.payload;
      return {
        ...state,
        initLeft: left,
        initTop: top,
        initRight: right,
        initBottom: bottom,
        ...action.payload,
        initZeroX: action.payload.zeroX,
        initZeroY: action.payload.zeroY,
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

const recPanelInitialState = {
  isHidden: true,
};

function recPanelReducer(state, action) {
  switch (action.type) {
    case 'SHOW_RECPANEL': {
      return {
        isHidden: false,
      };
    }
    case 'HIDE_RECPANEL': {
      return {
        isHidden: true,
      };
    }
    case 'TOGGLE_RECPANEL': {
      return {
        isHidden: !state.isHidden,
      };
    }
    default: {
      console.error(
        `recPanelReducer: unknown type ${JSON.stringify(action.type)}`
      );
      throw new Error(
        `recPanelReducer: unknown type ${JSON.stringify(action.type)}`
      );
    }
  }
}

export const UI_Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [classesPanelIsHidden, setClassesPanelIsHidden] = useState(true);
  const [gameInfoPanelIsHidden, setGameInfoPanelIsHidden] = useState(true);

  const [minimapState, minimapDispatch] = useReducer(
    minimapReducer,
    minimapInitialState
  );

  const [recPanelState, recPanelDispatch] = useReducer(
    recPanelReducer,
    recPanelInitialState
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

        recPanelState,
        recPanelDispatch,
      }}
    >
      {children}
    </UI_Context.Provider>
  );
};

export const useUiContext = () => useContext(UI_Context);

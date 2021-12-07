import { useState, useContext, createContext, useEffect } from 'react';
import { useReducer } from 'reinspect';
import { useDebug } from './debug/useDebug';

export const NOTIFICATION_TRANSITION = 500;
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
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  zeroX: 0,
  zeroY: 0,
  turnsToRender: [],
  minimapSize: { left: 0, top: 0, width: 0, height: 0 }, // размеры миникарты приходят из DOM (из компонента миникарты)
};

const minimapReducer = (state, action) => {
  switch (action.type) {
    case 'MAP_INIT': {
      const { left, right, top, bottom, zeroX, zeroY, turns } = action.payload;
      return {
        ...state,
        left,
        right,
        top,
        bottom,
        zeroX,
        zeroY,
        turns,
      };
    }
    case 'VIEWPORT_MOVED_ON_FIELD': {
      const { turns, zeroX, zeroY } = action.payload;
      return {
        ...state,
        // ...action.payload,
        zeroX,
        zeroY,
        turns,
      };
    }
    case 'MINIMAP_SHOW_HIDE': {
      return {
        ...state,
        isHidden: !state.isHidden,
      };
    }
    case 'TURNS_WERE_CHANGED': {
      const { turns } = action.payload;
      return {
        ...state,
        turns,
      };
    }
    case 'TURNS_TO_RENDER': {
      return {
        ...state,
        turnsToRender: action.payload,
      };
    }
    case 'MINIMAP_SIZE_UPDATED': {
      return {
        ...state,
        minimapSize: action.payload,
      };
    }
    default: {
      throw new Error(`unknown type of minimapReducer "${action.type}"`);
    }
  }
};

export const UI_Provider = ({ children }) => {
  // массив уведомлений в консоль событий
  const [notifications, setNotifications] = useState([]);
  const [windowSize, setWindowSize] = useState({
    innerHeight: 600,
    innerWidth: 800,
  });

  const debugData = useDebug();

  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (store) => store,
    'ui'
  );
  // const [classesPanelIsHidden, setClassesPanelIsHidden] = useState(true);
  const [gameInfoPanelIsHidden, setGameInfoPanelIsHidden] = useState(true);
  const [createEditTurnPopupIsHidden, setCreateEditTurnPopupIsHidden] =
    useState(true);

  const [minimapState, minimapDispatch] = useReducer(
    minimapReducer,
    minimapInitialState,
    (store) => store,
    'minimap'
  );

  const addNotification = ({ title, text }) => {
    const newNotifications = [...notifications, { title, text, status: 'new' }];
    setNotifications(newNotifications);
    setTimeout(() => {
      setNotifications((notifications) => {
        const newNotifications = [...notifications];
        newNotifications[0] = {
          ...newNotifications[0],
          status: 'old',
        };
        return newNotifications;
      });
    }, 3000);

    setTimeout(() => {
      setNotifications((notifications) => {
        const newNotifications = [...notifications];
        newNotifications.shift();
        return newNotifications;
      });
    }, 3000 + NOTIFICATION_TRANSITION);
  };

  useEffect(() => {
    if (!window) return;
    window.addEventListener('resize', () => {
      setWindowSize({
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      });
    });
  }, []);

  return (
    <UI_Context.Provider
      value={{
        gameInfoPanelIsHidden,
        setGameInfoPanelIsHidden,

        createEditTurnPopupIsHidden,
        setCreateEditTurnPopupIsHidden,

        state,
        dispatch,

        minimapState,
        minimapDispatch,

        notifications,
        addNotification,

        windowSize,

        debugData, // { debugLines, addDebugLine }
      }}
    >
      {children}
    </UI_Context.Provider>
  );
};

export const useUiContext = () => useContext(UI_Context);

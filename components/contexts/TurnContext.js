import { createContext, useContext } from 'react';

const TurnContext = createContext();

export const TurnProvider = ({
  children,

  turn,
  zeroPoint,
  can,
  dispatch,
  left,
  top,
  updateTurn,
  deleteTurn,
  setCreateEditTurnPopupIsHidden,
  tempMiddlewareFn,
  lineEnds: turnLineEnds,
  activeQuote, // активная цитата, на которую кликнули мышкой
  windowSize,
  saveTurnInBuffer,
  addNotification,
  lines,
}) => {
  const value = {
    turn,
    zeroPoint,
    can,
    dispatch,
    left,
    top,
    updateTurn,
    deleteTurn,
    setCreateEditTurnPopupIsHidden,
    tempMiddlewareFn,
    lineEnds: turnLineEnds,
    activeQuote, // активная цитата, на которую кликнули мышкой
    windowSize,
    saveTurnInBuffer,
    addNotification,
    lines,
  };

  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

import { createContext, useContext } from 'react';
import { useInteractionContext } from './InteractionContext';

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
  setInteractionMode,
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

    setInteractionMode,
  };
  console.log('turn ', turn?._id, ' rendered');
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

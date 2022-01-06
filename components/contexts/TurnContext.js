import { createContext, useContext } from 'react';
import { quoteRectangleThickness } from '../const';
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
  lineEnds,
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
    lineEnds,
    activeQuote, // активная цитата, на которую кликнули мышкой
    windowSize,
    saveTurnInBuffer,
    addNotification,
    lines,
    pictureQuotes: turn.quotes.filter((quote) => quote.type === 'picture'),
    paragraphQuotes: turn.quotes.filter((quote) => quote.type !== 'picture'),
    setInteractionMode,
  };
  // console.log('turn ', turn?._id, ' rendered');
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

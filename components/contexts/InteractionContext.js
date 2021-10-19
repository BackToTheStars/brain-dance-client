import { useState, useContext, createContext } from 'react';
import { useGameModeSettings } from './interaction-hooks/useGameModeSettings';

export const InteractionContext = createContext();

const MODE_GAME = 'game';
const MODE_WIDGET_PICTURE = 'widget-picture';
const MODE_WIDGET_PICTURE_QUOTE_ADD = 'widget-picture-quote-add';

//
export const InteractionProvider = ({ children }) => {
  //
  const [mode, setMode] = useState(MODE_GAME);

  const buttonSettings = {
    [MODE_GAME]: useGameModeSettings(), // @learn 'game': ...
  };

  const value = { buttons: buttonSettings[mode] };

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteractionContext = () => useContext(InteractionContext);

// buttonSettings[MODE_GAME] = [
//   null,
//   null,
//   null,
//   null,
//   null,
//   null,
//   null,
//   null,
//   null,
// ];

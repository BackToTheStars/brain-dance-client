import { useState, useContext, createContext } from 'react';
import { useGameModeSettings } from './interaction-hooks/useGameModeSettings';
import { usePictureModeSettings } from './interaction-hooks/usePictureModeSettings';

export const InteractionContext = createContext();

export const MODE_GAME = 'game';
export const MODE_WIDGET_PICTURE = 'widget-picture';
export const MODE_WIDGET_PICTURE_QUOTE_ADD = 'widget-picture-quote-add';

//
export const InteractionProvider = ({ children }) => {
  //
  const [interactionMode, setInteractionMode] = useState(MODE_GAME);
  const [activeWidget, setActiveWidget] = useState(null);
  const [interactionType, setInteractionType] = useState(null);

  const makeWidgetActive = (turnId, widgetType, widgetId) => {
    setActiveWidget({ turnId, widgetType, widgetId });
    setInteractionType(null);
  };

  const interactWithWidget = (newInteractionType) => {
    setInteractionType(newInteractionType);
  };

  const buttonSettings = {
    [MODE_GAME]: useGameModeSettings(), // @learn 'game': ...
    [MODE_WIDGET_PICTURE]: usePictureModeSettings({
      interactWithWidget,
      setInteractionMode,
      makeWidgetActive,
    }),
  };

  const value = {
    buttons: buttonSettings[interactionMode],
    activeWidget,
    makeWidgetActive,
    interactWithWidget,
    interactionType,
    setInteractionMode,
  };

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

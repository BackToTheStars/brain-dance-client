import { useState, useContext, createContext } from 'react';
import { useGameMode } from './interaction-hooks/useGameMode';
import { usePictureMode } from './interaction-hooks/usePictureMode';
import { usePictureQuoteAdd } from './interaction-hooks/usePictureQuoteAdd';
import { usePictureQuoteActive } from './interaction-hooks/usePictureQuoteActive';
import { useTurnContext } from './TurnContext';

export const InteractionContext = createContext();

export const MODE_GAME = 'game';
export const MODE_WIDGET_PICTURE = 'widget-picture';
export const MODE_WIDGET_PICTURE_QUOTE_ADD = 'widget-picture-quote-add';
export const MODE_WIDGET_PICTURE_QUOTE_ACTIVE = 'widget-picture-quote-active';

//
export const InteractionProvider = ({ children }) => {
  // ветка, по которой далее работаем (шаг, тип виджета, id виджета)
  const [activeWidget, setActiveWidget] = useState(null);
  // активный набор кнопок
  const [interactionMode, setInteractionMode] = useState(MODE_GAME);
  // действие внутри виджета
  const [interactionType, setInteractionType] = useState(null);

  const [actionsCallback, setActionsCallback] = useState(null);

  const { dispatch } = useTurnContext();

  // указываем конкретную ветку, по которой далее работаем (шаг, тип виджета, id виджета)
  const makeWidgetActive = (turnId, widgetType, widgetId) => {
    setActiveWidget({ turnId, widgetType, widgetId });
    setInteractionType(null);
  };

  const interactWithWidget = (newInteractionType) => {
    setInteractionType(newInteractionType);
  };

  // подтверждение действия внутри виджета
  const performActions = (callback) => {
    setActionsCallback(callback);
  };

  const buttonSettings = {
    [MODE_GAME]: useGameMode(), // @learn 'game': ...
    [MODE_WIDGET_PICTURE]: usePictureMode({
      interactWithWidget,
      setInteractionMode,
      makeWidgetActive,
    }),
    [MODE_WIDGET_PICTURE_QUOTE_ADD]: usePictureQuoteAdd({
      setInteractionMode,
      interactWithWidget,
      performActions,
    }),
    [MODE_WIDGET_PICTURE_QUOTE_ACTIVE]: usePictureQuoteActive({
      setInteractionMode,
      interactWithWidget,
      performActions,
      dispatch,
    }),
  };

  const value = {
    buttons: buttonSettings[interactionMode],
    activeWidget,
    makeWidgetActive,
    interactWithWidget,
    interactionType,
    setInteractionMode,
    actionsCallback,
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

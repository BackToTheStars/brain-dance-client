import {
  useState,
  useEffect,
  useContext,
  useReducer,
  createContext,
} from 'react';
import { getTurns } from '../../src/service';

export const TurnContext = createContext();

export const ACTION_FIELD_WAS_MOVED = 'action_field_was_moved';

export const TurnProvider = ({ children }) => {
  const [turns, setTurns] = useState([]);

  const dispatch = (actionType, payload) => {
    // можно его переделать в reducer
    if (actionType === ACTION_FIELD_WAS_MOVED) {
      setTurns(
        turns.map((turn) => ({
          ...turn,
          x: turn.x + payload.left,
          y: turn.y + payload.top,
        }))
      );
    }
  };

  useEffect(() => {
    getTurns().then((data) => {
      setTurns(data.items);
    });
  }, []);

  const value = { turns, dispatch };
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

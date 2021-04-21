import {
  useState,
  useEffect,
  useContext,
  useReducer,
  createContext,
} from 'react';
// import { getTurns } from '../../src/service';
import { useUserContext } from './UserContext';

export const TurnContext = createContext();

export const ACTION_FIELD_WAS_MOVED = 'action_field_was_moved';

export const TurnProvider = ({ children }) => {
  console.log('turn provider');
  const {
    request,
    info: { hash },
  } = useUserContext();
  const [originalTurns, setOriginalTurns] = useState([]);
  const [turns, setTurns] = useState([]);

  const dispatch = ({ type, payload }) => {
    console.log({ payload });
    // можно его переделать в reducer
    if (type === ACTION_FIELD_WAS_MOVED) {
      setTurns(
        originalTurns.map((turn) => ({
          ...turn,
          x: turn.x + payload.left,
          y: turn.y + payload.top,
        }))
      );
    }
  };

  useEffect(() => {
    request(`turns?hash=${hash}`, {
      tokenFlag: true,
    }).then((data) => {
      setOriginalTurns(data.items);
      setTurns(data.items);
    });
  }, []);

  const value = { turns, dispatch };
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

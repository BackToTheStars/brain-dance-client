import {
  useState,
  useEffect,
  useContext,
  useReducer,
  createContext,
} from 'react';
import { getTurns } from '../../src/service';

export const TurnContext = createContext();

export const TurnProvider = ({ children }) => {
  const [turns, setTurns] = useState([]);

  useEffect(() => {
    getTurns().then((data) => {
      setTurns(data.items);
      //   console.log(turns);
    });
  }, []);

  const value = { turns };
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

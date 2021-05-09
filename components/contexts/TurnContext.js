import {
  useState,
  useEffect,
  useContext,
  useReducer,
  createContext,
} from 'react';
// import { getTurns } from '../../src/service';
import { useUserContext } from './UserContext';
import { useUiContext } from './UI_Context';

export const TurnContext = createContext();

export const ACTION_FIELD_WAS_MOVED = 'action_field_was_moved';
export const ACTION_SET_ORIGINAL_TURNS = 'action_set_original_turns';
export const ACTION_DELETE_TURN = 'action_delete_turn';

const turnsInitialState = { turns: [], originalTurns: [] };
const turnsReducer = (state, action) => {
  switch (action.type) {
    case ACTION_SET_ORIGINAL_TURNS: {
      return {
        ...state,
        originalTurns: action.payload,
        turns: action.payload,
      };
    }
    case ACTION_FIELD_WAS_MOVED: {
      const { left, top } = action.payload;
      return {
        ...state,
        turns: state.originalTurns.map((turn) => ({
          ...turn,
          x: turn.x + left,
          y: turn.y + top,
        })),
      };
    }
    case ACTION_DELETE_TURN: {
      const { _id } = action.payload;
      return {
        ...state,
        originalTurns: state.originalTurns.filter((turn) => turn._id !== _id),
        turns: state.turns.filter((turn) => turn._id !== _id),
      };
    }
  }
};

const getScreenRect = (turnObjects) => {
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity,
    zeroX = 0,
    zeroY = 0;
  const turns = [];
  for (let turnObject of turnObjects) {
    const { x, y, height, width, _id, contentType } = turnObject; // собирает все ходы с экрана
    turns.push({ x, y, height, width, _id });
    if (contentType === 'zero-point') {
      zeroX = x;
      zeroY = y;
    } else {
      if (left > x) {
        left = x;
      }

      if (top > y) {
        top = y;
      }

      if (right < x + width) {
        right = x + width;
      }

      if (bottom < y + height) {
        bottom = y + height;
      }
    }
  }

  return {
    left,
    right,
    top,
    bottom,
    zeroX,
    zeroY,
    turns,
  };
};

export const TurnProvider = ({ children }) => {
  const [turnsState, turnsDispatch] = useReducer(
    turnsReducer,
    turnsInitialState
  );

  console.log('turn provider');
  const {
    request,
    info: { hash },
  } = useUserContext();
  const { minimapDispatch } = useUiContext();
  // const [originalTurns, setOriginalTurns] = useState([]);
  // const [turns, setTurns] = useState([]);

  const createTurn = (body, callbacks = {}) => {
    request(
      `turns?hash=${hash}`,
      {
        method: 'POST',
        tokenFlag: true,
        body: body,
      },
      {
        successCallback: (data) => {
          console.log('успешный коллбэк на уровне TurnContext');
          console.log({ data });
          if (callbacks.successCallback) {
            callbacks.successCallback(data);
          }
          // turnsDispatch({ type: ACTION_SET_ORIGINAL_TURNS, payload: data.items });
        },
        ...callbacks,
      }
    );
    // .then((data) => {
    //   console.log({ data });
    //   //   turnsDispatch({ type: ACTION_SET_ORIGINAL_TURNS, payload: data.items });
    // })
    // .catch((err) => {
    //   console.log({ err });
    // });
  };

  useEffect(() => {
    request(`turns?hash=${hash}`, {
      tokenFlag: true,
    }).then((data) => {
      turnsDispatch({ type: ACTION_SET_ORIGINAL_TURNS, payload: data.items });
      minimapDispatch({ type: 'MAP_INIT', payload: getScreenRect(data.items) });

      // setOriginalTurns(data.items);
      // setTurns(data.items);
    });
  }, []);

  // useEffect(() => {
  //   minimapDispatch({
  //     type: 'VIEWPORT_MOVED_ON_FIELD',
  //     payload: {
  //       turnsState.turns, // с учётом новых координат ZeroPoint
  //     },
  //   });
  // }, []); // @todo: вызвать при изменении координат ZeroPoint

  const value = {
    turns: turnsState.turns,
    dispatch: turnsDispatch,
    createTurn,
  };
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

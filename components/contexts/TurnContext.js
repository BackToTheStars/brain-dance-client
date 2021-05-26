import { useState, useEffect, useContext, createContext } from 'react';
import { useReducer } from 'reinspect';
// import { getTurns } from '../../src/service';
import { useUserContext } from './UserContext';
import { useUiContext } from './UI_Context';

export const TurnContext = createContext();

export const ACTION_LINES_INIT = 'action_lines_init';
export const ACTION_FIELD_WAS_MOVED = 'action_field_was_moved';
export const ACTION_SET_ORIGINAL_TURNS = 'action_set_original_turns';
export const ACTION_DELETE_TURN = 'action_delete_turn';
export const ACTION_TURN_WAS_CHANGED = 'action_turn_was_changed';
export const ACTION_TURN_CREATED = 'action_turn_created';
export const ACTION_TURNS_SYNC_DONE = 'action_turns_sync_done';

const linesInitialState = { lines: [] };
const linesReducer = (state, action) => {
  switch (action.type) {
    case ACTION_LINES_INIT: {
      return {
        ...state,
        lines: action.payload,
      };
    }
  }
};

const turnsInitialState = {
  turns: [],
  originalTurns: [],
  left: 0,
  top: 0,
};
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
        left,
        top,
        // turns: state.originalTurns.map((turn) => ({
        turns: state.turns.map((turn) => ({
          ...turn,
          x: turn.x + left,
          y: turn.y + top,
        })),
      };
    }
    case ACTION_TURNS_SYNC_DONE: {
      return {
        ...state,
        turns: state.turns.map((turn) => {
          return { ...turn, wasChanged: false };
        }),
      };
    }
    case ACTION_TURN_WAS_CHANGED: {
      const { _id, wasChanged } = action.payload;
      return {
        ...state,
        turns: state.turns.map((turn) => {
          if (_id === turn._id) {
            return {
              ...turn,
              ...action.payload,
            };
          } else {
            return turn;
          }
        }),
      };
    }
    case ACTION_TURN_CREATED: {
      return {
        ...state,
        turns: [...state.turns, action.payload],
        originalTurns: [...state.originalTurns, action.payload],
      };
    }
    case ACTION_DELETE_TURN: {
      const { _id } = action.payload;
      return {
        ...state,
        originalTurns: state.originalTurns.filter((turn) => turn._id !== _id), // @todo: проверить, нужны ли originalTurns
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
    turnsInitialState,
    (store) => store,
    'turns'
  );
  const [linesState, linesDispatch] = useReducer(
    linesReducer,
    linesInitialState
  );

  const [viewPort, setViewPort] = useState({ left: 0, top: 0 });

  const { turns, left, top } = turnsState;

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
        },
        ...callbacks,
      }
    );
  };
  const deleteTurn = (id, callbacks = {}) => {
    request(
      `turns/${id}?hash=${hash}`,
      {
        method: 'DELETE',
        tokenFlag: true,
      },
      {
        successCallback: (data) => {
          //   console.log('успешный коллбэк на уровне TurnContext');
          //   console.log({ data });
          if (callbacks.successCallback) {
            callbacks.successCallback(data);
          }
        },
        ...callbacks,
      }
    );
  };

  const saveField = () => {
    const changedTurns = turns
      .filter((turn) => turn.wasChanged === true)
      .map((turn) => {
        const { _id, x, y, height, width, contentType, scrollPosition } = turn;
        return {
          _id,
          x: x - viewPort.left,
          y: y - viewPort.top,
          height,
          width,
          contentType,
          scrollPosition,
        };
      }); // ход был изменён, сохранить только его

    request(`games/viewport?hash=${hash}`, {
      tokenFlag: true,
      method: 'PUT',
      body: {
        x: -viewPort.left,
        y: -viewPort.top,
      },
    }).then((data) => {
      // console.log(data);
    });

    request(`turns/coordinates?hash=${hash}`, {
      tokenFlag: true,
      method: 'PUT',
      body: {
        turns: changedTurns,
      },
    }).then((data) => {
      turnsDispatch({ type: ACTION_TURNS_SYNC_DONE });
    });
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

  useEffect(() => {
    minimapDispatch({
      type: 'TURNS_WERE_CHANGED',
      payload: { turns },
    });
  }, [turns]);

  useEffect(() => {
    setViewPort({ left: viewPort.left + left, top: viewPort.top + top });
    minimapDispatch({
      type: 'VIEWPORT_MOVED_ON_FIELD',
      payload: {
        turns,
        zeroX: viewPort.left + left,
        zeroY: viewPort.top + top,
        // turnsState.turns, // с учётом новых координат ZeroPoint
      },
    });
  }, [left, top]);

  //   useEffect(() => {
  //     minimapDispatch({
  //     type: 'VIEWPORT_MOVED_ON_FIELD',
  //     payload: {
  //       turns,
  //       // turnsState.turns, // с учётом новых координат ZeroPoint
  //     },
  //   });
  //   }, [turns]);

  const value = {
    saveField,
    turns: turnsState.turns,
    dispatch: turnsDispatch,
    createTurn,
    deleteTurn,
    left: viewPort.left,
    top: viewPort.top,
    linesState,
    linesDispatch,
  };
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

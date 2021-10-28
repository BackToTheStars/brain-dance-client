import { useState, useEffect, useContext, createContext } from 'react';
import { useReducer } from 'reinspect';
// import { getTurns } from '../../src/service';
import { useUserContext } from './UserContext';
import { useUiContext } from './UI_Context';
import { getLinesCoords, getLineEnds } from '../helpers/line';

export const TurnContext = createContext();

export const ACTION_FIELD_WAS_MOVED = 'action_field_was_moved';

export const ACTION_SET_ORIGINAL_TURNS = 'action_set_original_turns';
export const ACTION_DELETE_TURN = 'action_delete_turn';
export const ACTION_TURN_WAS_CHANGED = 'action_turn_was_changed';
export const ACTION_TURN_CREATED = 'action_turn_created';
export const ACTION_TURNS_SYNC_DONE = 'action_turns_sync_done';
export const ACTION_RESET_TURN_EDIT_MODE = 'action_reset_turn_edit_mode';
export const ACTION_SET_TURN_TO_EDIT_MODE = 'action_set_turn_to_edit_mode';

export const ACTION_QUOTE_CLICKED = 'action_quote_clicked';
export const ACTION_QUOTE_COORDS_UPDATED = 'action_quote_coords_updated';
export const ACTION_PICTURE_QUOTE_COORDS_UPDATED =
  'action_picture_quote_coords_updated';

export const ACTION_UPDATE_LINE_ENDS = 'action_update_line_ends';

export const ACTION_LINES_INIT = 'action_lines_init';
export const ACTION_LINES_DELETE = 'action_lines_delete';
export const ACTION_LINE_SENT_TO_BACKEND = 'action_line_sent_to_backend';
export const ACTION_LINE_CREATED = 'action_line_created';
export const ACTION_RECALCULATE_LINES = 'action_recalculate_lines';

const turnsInitialState = {
  turnToEdit: null,
  turns: [],
  // originalTurns: [],
  left: 0,
  top: 0,
  activeQuote: null,
  lines: [],
  lineToAdd: null,

  quotesInfo: {}, // для текстовых цитат
  pictureQuotesInfo: {}, // для цитат на картинках

  linesWithEndCoords: [],
  lineEnds: {},
};
const turnsReducer = (state, action) => {
  switch (action.type) {
    case ACTION_SET_ORIGINAL_TURNS: {
      return {
        ...state,
        // originalTurns: action.payload,
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
        // originalTurns: [...state.originalTurns, action.payload],
      };
    }
    case ACTION_RESET_TURN_EDIT_MODE: {
      return {
        ...state,
        turnToEdit: null,
      };
    }
    case ACTION_SET_TURN_TO_EDIT_MODE: {
      return {
        ...state,
        turnToEdit: state.turns.find((turn) => turn._id === action.payload._id),
      };
    }
    case ACTION_DELETE_TURN: {
      const { _id } = action.payload;
      return {
        ...state,
        // originalTurns: state.originalTurns.filter((turn) => turn._id !== _id), // @todo: проверить, нужны ли originalTurns
        turns: state.turns.filter((turn) => turn._id !== _id),
      };
    }
    case ACTION_QUOTE_CLICKED: {
      const { turnId, quoteId } = action.payload;
      // активной цитаты не было
      if (!state.activeQuote) {
        return {
          ...state,
          activeQuote: { turnId, quoteId },
        };
      }
      // кликнули на ту же цитату
      if (
        turnId === state.activeQuote.turnId &&
        quoteId === state.activeQuote.quoteId
      ) {
        return {
          ...state,
          activeQuote: null,
        };
      }
      //   console.log({ turnId, quoteId });

      const line = state.lines.find(
        (line) =>
          (line.sourceTurnId === turnId &&
            line.sourceMarker === quoteId &&
            line.targetTurnId === state.activeQuote.turnId &&
            line.targetMarker === state.activeQuote.quoteId) ||
          (line.sourceTurnId === state.activeQuote.turnId &&
            line.sourceMarker === state.activeQuote.quoteId &&
            line.targetTurnId === turnId &&
            line.targetMarker === quoteId)
      );

      if (line) {
        return {
          ...state,
          activeQuote: { turnId, quoteId },
        };
      }

      return {
        ...state,
        activeQuote: null,
        lineToAdd: {
          sourceTurnId: state.activeQuote.turnId,
          targetTurnId: turnId,
          sourceMarker: state.activeQuote.quoteId,
          targetMarker: quoteId,
        },
      };
    }

    case ACTION_QUOTE_COORDS_UPDATED: {
      const { turnId, quotesInfo } = action.payload;
      return {
        ...state,
        quotesInfo: { ...state.quotesInfo, [turnId]: quotesInfo },
      };
    }

    case ACTION_PICTURE_QUOTE_COORDS_UPDATED: {
      const { turnId, pictureQuotesInfo } = action.payload;
      return {
        ...state,
        pictureQuotesInfo: {
          ...state.pictureQuotesInfo,
          [turnId]: pictureQuotesInfo,
        },
      };
    }

    case ACTION_LINES_INIT: {
      return {
        ...state,
        lines: action.payload,
      };
    }
    case ACTION_LINES_DELETE: {
      const lineIds = {};
      for (let lineToDelete of action.payload) {
        lineIds[lineToDelete] = true;
      }
      return {
        ...state,
        activeQuote: null,
        lines: state.lines.filter((line) => !lineIds[line._id]),
      };
    }
    case ACTION_LINE_SENT_TO_BACKEND: {
      return {
        ...state,
        lineToAdd: null,
      };
    }
    case ACTION_LINE_CREATED: {
      return {
        ...state,
        lines: [...state.lines, action.payload],
      };
    }
    case ACTION_RECALCULATE_LINES: {
      return {
        ...state,
        linesWithEndCoords: action.payload,
      };
    }
    case ACTION_UPDATE_LINE_ENDS: {
      return {
        ...state,
        lineEnds: action.payload,
      };
    }
    default: {
      throw new Error(`unknown action type ${action.type}`);
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

  const {
    turns,
    lines,
    turnToEdit,
    activeQuote,
    quotesInfo,
    pictureQuotesInfo,
    linesWithEndCoords,
    left,
    top,
    lineToAdd,
    lineEnds,
  } = turnsState;

  // @todo: remove
  // const [linesState, linesDispatch] = useReducer(
  //   linesReducer,
  //   linesInitialState
  // );

  const [viewPort, setViewPort] = useState({ left: 0, top: 0 });

  const {
    request,
    info: { hash },
    getTurnFromBufferAndRemove,
  } = useUserContext();
  const {
    minimapDispatch,
    minimapState: { turnsToRender },
    addNotification,
  } = useUiContext();

  const insertTurnFromBuffer = ({ successCallback, errorCallback }) => {
    const turn = getTurnFromBufferAndRemove();
    if (!turn) {
      errorCallback('No turn in buffer');
      return false;
    }
    createTurn(turn, { successCallback, errorCallback });
  };

  const createTurn = (turn, { successCallback, errorCallback }) => {
    const zeroPoint = turns.find((turn) => turn.contentType === 'zero-point');
    const { x: zeroPointX, y: zeroPointY } = zeroPoint;
    turn.x = -zeroPointX + Math.floor(window.innerWidth / 2) - 250;
    turn.y = -zeroPointY + Math.floor(window.innerHeight / 2) - 250;

    // создать шаг, закрыть модальное окно
    createTurnRequest(turn, {
      successCallback: (data) => {
        // setCreateEditTurnPopupIsHidden(true);
        successCallback(data);
        turnsDispatch({
          type: ACTION_TURN_CREATED,
          payload: {
            ...data.item,
            x: data.item.x + zeroPointX,
            y: data.item.y + zeroPointY,
          },
        });
      },
      errorCallback,
    });
  };

  const createTurnRequest = (body, callbacks = {}) => {
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

  const updateTurn = (id, body, callbacks = {}) => {
    request(
      `turns/${id}?hash=${hash}`,
      {
        method: 'PUT',
        tokenFlag: true,
        body: body,
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

  const deleteLines = (ids, callbacks = {}) => {
    request(
      `lines?hash=${hash}`,
      {
        method: 'DELETE',
        tokenFlag: true,
        body: ids,
      },
      {
        successCallback: (data) => {
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
      .filter((turn) => turn.height !== 40) // @todo этот фильтр нужно удалить
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
      addNotification({ title: 'Info:', text: 'Field has been saved' });
    });
  };

  const createLine = (lineToAdd, callbacks = {}) => {
    request(
      `lines?hash=${hash}`,
      {
        method: 'POST',
        tokenFlag: true,
        body: lineToAdd,
      },
      {
        successCallback: (data) => {
          console.log('успешный коллбэк createLine');
          console.log({ data });
          if (callbacks.successCallback) {
            callbacks.successCallback(data);
          }
        },
        ...callbacks,
      }
    );
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
    if (!lineToAdd) return;
    turnsDispatch({ type: ACTION_LINE_SENT_TO_BACKEND });
    createLine(lineToAdd, {
      successCallback: (data) => {
        turnsDispatch({ type: ACTION_LINE_CREATED, payload: data.item });
      },
    });
  }, [lineToAdd]);

  useEffect(() => {
    minimapDispatch({
      type: 'TURNS_WERE_CHANGED',
      payload: { turns },
    });
  }, [turns]);

  useEffect(() => {
    const linesWithEndCoords = getLinesCoords(
      lines,
      turns,
      turnsToRender,
      quotesInfo,
      pictureQuotesInfo
    );
    turnsDispatch({
      type: ACTION_RECALCULATE_LINES,
      payload: linesWithEndCoords,
    });
    turnsDispatch({
      type: ACTION_UPDATE_LINE_ENDS,
      payload: getLineEnds(linesWithEndCoords),
    });
  }, [lines, turns, turnsToRender, quotesInfo, pictureQuotesInfo]);

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

  const tempMiddlewareFn = (action) => {
    // @todo move
    switch (action.type) {
      case ACTION_DELETE_TURN:
        // найти линии по этому шагу
        const linesToDelete = turnsState.lines.filter(
          (line) =>
            line.sourceTurnId === action.payload._id ||
            line.targetTurnId === action.payload._id
        );
        if (!!linesToDelete.length) {
          turnsDispatch({ type: ACTION_LINES_DELETE, payload: linesToDelete });
        }
        break;
    }
  };

  const value = {
    saveField,
    turns,
    turnToEdit,
    activeQuote,
    quotesInfo,
    pictureQuotesInfo,
    linesWithEndCoords,
    lineEnds, // концы линий с цитатами
    dispatch: turnsDispatch,
    createTurn,
    deleteTurn,
    updateTurn,
    deleteLines,
    left: viewPort.left,
    top: viewPort.top,
    lines: turnsState.lines,
    tempMiddlewareFn,
    insertTurnFromBuffer,
    // linesState,
    // linesDispatch,
  };
  return <TurnContext.Provider value={value}>{children}</TurnContext.Provider>;
};

export const useTurnContext = () => useContext(TurnContext);

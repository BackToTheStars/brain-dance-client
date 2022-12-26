import turnSettings from '../settings';
import * as types from './types';

const initialTurnsState = {
  turns: [],
  d: {},
  error: null,
  zeroPointId: null,
  updateGeometryTime: 0,
  turnsToPaste: [],
  pasteNextTurnPosition: null,
};

export const getStageHistory = (currentStages, newStage) => {
  if (!currentStages) return [newStage];
  if (!newStage) return currentStages;
  if (currentStages.slice(-1)[0] === newStage) return currentStages;
  return [...currentStages, newStage].slice(-7);
};

export const turnsReducer = (state = initialTurnsState, { type, payload }) => {
  switch (type) {
    case types.TURNS_UPDATE_GEOMETRY_TIME:
      return {
        ...state,
        updateGeometryTime: new Date().getTime(),
      };
    case types.LOAD_TURNS:
      return {
        ...state,
        turns: payload.turns,
        zeroPointId: payload.turns.find(
          (turn) => turn.contentType === turnSettings.TEMPLATE_ZERO_POINT
        )._id,
        d: payload.turns.reduce((a, turn) => {
          a[turn._id] = turn;
          return a;
        }, {}),
        updateGeometryTime: new Date().getTime(),
      };
    case types.TURNS_UPDATE_GEOMETRY:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            ...payload,
            // wasChanged: true,
          },
        },
        updateGeometryTime: new Date().getTime(),
      };
    case types.TURN_PARAGRAPH_SET_IS_READY:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            paragraphIsReady: payload.value,
          },
        },
      };
    case types.TURN_SET_STAGE:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            turnStage: payload.turnStage,
            turnStages: getStageHistory(
              state.d[payload._id].turnStages,
              payload.turnStage
            ),
            paragraphStages: getStageHistory(
              state.d[payload._id].paragraphStages,
              payload.paragraphStage
            ),
            ...payload,
            // @todo: id параграфа
          },
        },
      };
    case types.TURN_PARAGRAPH_SET_STAGE:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            paragraphStage: payload.stage,
            paragraphStages: getStageHistory(
              state.d[payload._id].paragraphStages,
              payload.stage
            ),
          },
        },
      };

    case types.TURN_WAS_CHANGED:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            wasChanged: true,
          },
        },
      };
    case types.TURNS_SCROLL: {
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            scrollPosition: payload.scrollPosition,
          },
        },
      };
    }
    case types.TURNS_FIELD_WAS_MOVED: {
      const { left, top } = payload;
      const newState = { ...state };
      for (let id in state.d) {
        newState.d[id] = {
          ...newState.d[id],
          x: newState.d[id].x - left,
          y: newState.d[id].y - top,
        };
      }
      newState.updateGeometryTime = new Date().getTime();
      return newState;
    }

    case types.TURNS_SYNC_DONE: {
      const newState = { ...state };
      for (let id in state.d) {
        newState.d[id] = {
          ...newState.d[id],
          wasChanged: false,
        };
      }
      return newState;
    }

    case types.TURN_CREATE: {
      return {
        ...state,
        turns: [...state.turns, payload],
        d: {
          ...state.d,
          [payload._id]: payload,
        },
        updateGeometryTime: new Date().getTime(),
      };
    }

    case types.TURN_RESAVE: {
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: payload,
        },
      };
    }

    case types.TURN_DELETE: {
      // в payload прилетит _id
      const preparedD = { ...state.d };
      delete preparedD[payload];

      return {
        ...state,
        turns: state.turns.filter((turn) => turn._id !== payload),
        d: preparedD,
        // updateGeometryTime: new Date().getTime(),
      };
    }

    case types.TURNS_LOAD_TO_PASTE: {
      return { ...state, turnsToPaste: payload.turnsToPaste };
    }

    case types.TURN_NEXT_PASTE_POSITION: {
      return { ...state, pasteNextTurnPosition: payload };
    }

    default:
      return state;
  }
};

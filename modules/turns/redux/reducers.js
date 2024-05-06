import { isTurnInsideRenderArea } from '../components/helpers/sizeHelper';
import turnSettings, { TURN_READY } from '../settings';
import * as types from './types';

const initialTurnsState = {
  turnsToRender: [],
  d: {},
  g: {},
  error: null,
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
    case types.TURNS_LOAD_GEOMETRY: {
      const g = payload.turns.reduce((a, turn) => {
        a[turn._id] = turn;
        return a;
      }, {});
      const turnsToRender = [];
      for (let id in g) {
        if (isTurnInsideRenderArea(g[id], payload.viewport)) {
          turnsToRender.push(id);
        }
      }
      return {
        ...state,
        g,
        turnsToRender,
      }
    }
    case types.TURN_UPDATE_GEOMETRY:
      return {
        ...state,
        g: {
          ...state.g,
          [payload._id]: {
            ...state.g[payload._id],
            ...payload,
          },
        },
      };
    case types.TURNS_UPDATE_GEOMETRY:
      return {
        ...state,
        g: {
          ...state.g,
          ...payload.turns.reduce(
            (a, turn) => ({
              ...a,
              [turn._id]: {
                ...state.g[turn._id],
                ...turn,
              },
            }),
            {}
          ),
        },
      }
    case types.TURN_UPDATE_WIDGET: {
      const { turnId, widgetId, widget } = payload;
      const prevTurn = state.d[turnId];
      return {
        ...state,
        d: {
          ...state.d,
          [turnId]: {
            ...prevTurn,
            dWidgets: {
              ...prevTurn.dWidgets,
              [widgetId]: widget,
            },
            // wasChanged: true,
          },
        },
      };
    }

    case types.TURNS_SET_LOADING: { // @fixme
      return {
        ...state,
        d: {
          ...state.d,
          ...payload.reduce(
            (a, id) => ({
              ...a,
              [id]: {
                ...state.d[id],
                loadStatus: 'loading',
              },
            }),
            {}
          ),
        },
      };
    }

    case types.TURNS_LOAD_DATA: {
      return {
        ...state,
        d: {
          ...state.d,
          ...payload.turns.reduce(
            (a, { position, size, loadStatus, ...turn }) => {
              a[turn._id] = {
                ...state.d[turn._id],
                loadStatus: 'loaded',
                data: turn,
              };
              return a;
            },
            {}
          ),
        },
      };
    }
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
            wasReady:
              state.d[payload._id].wasReady || payload.turnStage === TURN_READY,
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
      const g = state.g;
      const turnsToRender = [];
      for (let id in g) {
        if (isTurnInsideRenderArea(g[id], payload)) {
          turnsToRender.push(id);
        }
      }
      return {
        ...state,
        turnsToRender,
      };
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
        // d: {
        //   ...state.d,
        //   [payload._id]: payload, // @todo: data fields
        // },
        g: {
          ...state.g,
          [payload._id]: payload, // @todo: geometry fields
        },
        turnsToRender: [...state.turnsToRender, payload._id],
      };
    }

    case types.TURN_RESAVE: {
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: payload,
        },
        g: {
          ...state.g,
          [payload._id]: payload,
        }
      };
    }

    case types.TURN_DELETE: {
      // в payload прилетит _id
      const preparedD = { ...state.d };
      delete preparedD[payload];
      const preparedG = { ...state.g };
      delete preparedG[payload];

      return {
        ...state,
        d: preparedD,
        g: preparedG,
        turnsToRender: state.turnsToRender.filter(
          (turnId) => turnId !== payload
        ),
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

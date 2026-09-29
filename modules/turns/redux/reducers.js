import { isTurnInsideRenderArea } from '../components/helpers/sizeHelper';
import turnSettings, { TURN_READY } from '../settings';
import * as types from './types';

// `saved` / `savedScroll` — геометрия и прокрутка, какими они лежат на сервере. Не в `g`
// и `d`: открытая форма хода перезаполняется при любой смене записи своего хода там.
const initialTurnsState = {
  turnsToRender: [],
  d: {},
  g: {},
  saved: {},
  savedScroll: {},
  error: null,
  turnsToPaste: [],
  pasteNextTurnPosition: null,
  scrollPositions: {},
};

const toSaved = ({ position, size, splitHeight }) => ({
  x: position?.x,
  y: position?.y,
  width: size?.width,
  height: size?.height,
  splitHeight,
});

const isSameGeometry = (turn, { position, size }) =>
  turn.position?.x === position.x &&
  turn.position?.y === position.y &&
  turn.size?.width === size.width &&
  turn.size?.height === size.height;

// Ключи прокрутки — `${turnId}_${widgetId}`.
const withoutTurnKeys = (dict, ids) => {
  const prefixes = ids.map((id) => `${id}_`);
  const result = {};
  for (const key in dict) {
    if (!prefixes.some((prefix) => key.startsWith(prefix))) result[key] = dict[key];
  }
  return result;
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
      const saved = {};
      for (let id in g) {
        if (isTurnInsideRenderArea(g[id], payload.viewport)) {
          turnsToRender.push(id);
        }
        // splitHeight приходит только с телом хода (TURNS_LOAD_DATA)
        saved[id] = toSaved({
          ...g[id],
          splitHeight: state.saved[id]?.splitHeight,
        });
      }
      return {
        ...state,
        g,
        saved,
        turnsToRender,
      };
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
    // Неизменный ход не переписывается: на его запись подписана форма хода.
    case types.TURNS_UPDATE_GEOMETRY: {
      const g = { ...state.g };
      let changed = false;
      for (const turn of payload.turns) {
        const current = g[turn._id];
        if (!current || isSameGeometry(current, turn)) continue;
        g[turn._id] = { ...current, position: turn.position, size: turn.size };
        changed = true;
      }
      return changed ? { ...state, g } : state;
    }
    case types.TURNS_GEOMETRY_SAVED: {
      const saved = { ...state.saved };
      for (const { _id, splitHeight, ...geometry } of payload.turns) {
        saved[_id] = {
          ...saved[_id],
          ...geometry,
          ...(typeof splitHeight === 'number' ? { splitHeight } : {}),
        };
      }
      return { ...state, saved };
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
          },
        },
      };
    }

    case types.TURNS_LOAD_DATA: {
      const saved = { ...state.saved };
      for (const { _id, splitHeight } of payload.turns) {
        saved[_id] = { ...saved[_id], splitHeight };
      }
      return {
        ...state,
        d: {
          ...state.d,
          ...payload.turns.reduce((a, { position, size, ...turn }) => {
            a[turn._id] = {
              ...state.d[turn._id],
              ...turn,
            };
            return a;
          }, {}),
        },
        saved,
        savedScroll: withoutTurnKeys(
          state.savedScroll,
          payload.turns.map(({ _id }) => _id),
        ),
      };
    }
    // case types.TURN_SET_STAGE:
    //   return {
    //     ...state,
    //     d: {
    //       ...state.d,
    //       [payload._id]: {
    //         ...state.d[payload._id],
    //         turnStage: payload.turnStage,
    //         turnStages: getStageHistory(
    //           state.d[payload._id].turnStages,
    //           payload.turnStage
    //         ),
    //         paragraphStages: getStageHistory(
    //           state.d[payload._id].paragraphStages,
    //           payload.paragraphStage
    //         ),
    //         ...payload,
    //         // @todo: id параграфа
    //       },
    //     },
    //   };

    // Высота верхнего виджета лежит в данных хода (сервер отдаёт её только с
    // телом хода), а сохраняется вместе с геометрией: Save Field сравнивает её
    // с `saved`.
    case types.TURN_UPDATE_SPLIT_HEIGHT:
      return {
        ...state,
        d: {
          ...state.d,
          [payload._id]: {
            ...state.d[payload._id],
            splitHeight: payload.splitHeight,
          },
        },
      };
    case types.TURNS_SCROLL: {
      return {
        ...state,
        scrollPositions: {
          ...state.scrollPositions,
          [`${payload.turnId}_${payload.widgetId}`]: payload,
        },
      };
      // return {
      //   ...state,
      //   d: {
      //     ...state.d,
      //     [payload.turnId]: {
      //       ...state.d[payload.turnId],
      //       dWidgets: {
      //         ...state.d[payload.turnId].dWidgets,
      //         [payload.widgetId]: {
      //           ...state.d[payload.turnId].dWidgets[payload.widgetId],
      //           scrollPosition: payload.scrollPosition,
      //         },
      //       }
      //     },
      //   },
      // };
    }
    case types.TURNS_SCROLL_SAVED: {
      const savedScroll = { ...state.savedScroll };
      for (const { turnId, widgetId, scrollPosition } of payload) {
        savedScroll[`${turnId}_${widgetId}`] = scrollPosition;
      }
      return { ...state, savedScroll };
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

    // Созданный и перезаписанный формой ход приходит ответом сервера: это и есть
    // его сохранённая геометрия.
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
        saved: { ...state.saved, [payload._id]: toSaved(payload) },
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
        },
        saved: { ...state.saved, [payload._id]: toSaved(payload) },
        savedScroll: withoutTurnKeys(state.savedScroll, [payload._id]),
      };
    }

    case types.TURN_DELETE: {
      // в payload прилетит _id
      const preparedD = { ...state.d };
      delete preparedD[payload];
      const preparedG = { ...state.g };
      delete preparedG[payload];
      const saved = { ...state.saved };
      delete saved[payload];

      return {
        ...state,
        d: preparedD,
        g: preparedG,
        saved,
        savedScroll: withoutTurnKeys(state.savedScroll, [payload]),
        scrollPositions: withoutTurnKeys(state.scrollPositions, [payload]),
        turnsToRender: state.turnsToRender.filter(
          (turnId) => turnId !== payload,
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

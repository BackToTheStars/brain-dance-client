import * as types from './types';
import * as gameTypes from '@/modules/game/game-redux/types';
import * as quotesTypes from '@/modules/quotes/redux/types';
import {
  createTurnRequest,
  deleteTurnRequest,
  getTokenRequest,
  getTurnsByIdsRequest,
  getTurnsGeometryRequest,
  updateTurnRequest,
} from '../requests';
import {
  dataCopy,
  fieldRemover,
  getTimeStamps,
  getTurnFromBufferAndRemove,
  saveTurnInBuffer,
} from '../components/helpers/dataCopier';
import turnSettings from '../settings';
import { addNotification } from '@/modules/ui/redux/actions';
import {
  centerViewportAtPosition,
  loadTurnsAndLinesToPaste,
} from '@/modules/game/game-redux/actions';
import { linesCreate, linesDelete } from '@/modules/lines/redux/actions';
import { filterLinesByTurnId } from '@/modules/lines/components/helpers/line';
import { setPanelMode, togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_TURNS_PASTE } from '@/modules/panels/settings';
import { STATIC_API_URL } from '@/config/server';

import { GRID_CELL_X, GRID_CELL_Y } from '@/config/ui';
import { snapRound } from '../components/helpers/grid';
import { TurnHelper } from './helpers';
import { getBoundingAreaRect } from '@/modules/minimap/components/helpers/screen';
import {
  isBorderCoincides,
  isRectInsideArea,
} from '../components/helpers/sizeHelper';
import { MODE_GAME } from '@/config/panel';

export const moveFieldToTopLeft = (turn) => (dispatch, getState) => {
  const state = getState();
  const isSnapToGrid = true;
  const gameFieldMoveVector = isSnapToGrid
    ? {
        left: snapRound(turn.position.x, GRID_CELL_X),
        top: snapRound(turn.position.y, GRID_CELL_Y),
      }
    : { left: turn.position.x, top: turn.position.y };
  dispatch(moveField(gameFieldMoveVector));
};

export const loadTurnsGeometry = (hash, position) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const viewport = {
      position,
      size: {
        width: state.game.viewport.width,
        height: state.game.viewport.height,
      },
    };
    return getTurnsGeometryRequest(hash).then((data) => {
      dispatch({
        type: types.TURNS_LOAD_GEOMETRY,
        payload: {
          viewport,
          turns: data.items,
        },
      });
      dispatch({
        type: gameTypes.GAME_SCREEN_RECT_SET,
        payload: getBoundingAreaRect([...data.items], viewport),
      });
      resolve();
    });
  });
};

export const loadTurnsData = (turnIds) => (dispatch) => {
  return getTurnsByIdsRequest(turnIds).then((data) => {
    dispatch({
      type: types.TURNS_LOAD_DATA,
      payload: {
        turns: data.items.map((turn) => TurnHelper.toNewFields(turn)),
      },
    });
  });
};

export const updateGeometry = (data) => (dispatch) => {
  return dispatch({
    type: types.TURN_UPDATE_GEOMETRY,
    payload: data,
  });
};

export const updateWidget = (turnId, widgetId, widget) => (dispatch) => {
  dispatch({
    type: types.TURN_UPDATE_WIDGET,
    payload: { turnId, widgetId, widget },
  });
  dispatch(markTurnAsChanged({ _id: turnId }));
};

export const markTurnAsChanged =
  ({ _id }) =>
  (dispatch, getState) => {
    const state = getState();
    const turn = state.turns.d[_id];
    if (turn.wasChanged) return;
    return dispatch({
      type: types.TURN_WAS_CHANGED,
      payload: { _id },
    });
  };

export const compressParagraph = () => (dispatch, getState) => {
  const state = getState();
  const editTurnId = state.panels.editTurnId;
  const activeTurnData = state.turns.d[editTurnId];
  const activeTurnGeometry = state.turns.g[editTurnId];
  const currentWidget = activeTurnData.dWidgets['p_1'];

  updateTurnRequest(editTurnId, {
    compressed: true,
    uncompressedHeight: activeTurnGeometry.size.height,
  }).then(() => {
    dispatch({
      type: types.TURN_UPDATE_WIDGET,
      payload: {
        turnId: editTurnId,
        widgetId: 'p_1',
        widget: {
          ...currentWidget,
          compressed: true,
        },
      },
    });
  });
};

export const unCompressParagraph = () => (dispatch, getState) => {
  const state = getState();
  const editTurnId = state.panels.editTurnId;
  const activeTurnData = state.turns.d[editTurnId];
  const currentWidget = activeTurnData.dWidgets['p_1'];
  updateTurnRequest(editTurnId, {
    compressed: false,
    height: activeTurnData.uncompressedHeight,
  }).then((data) => {
    dispatch({
      type: types.TURN_UPDATE_WIDGET,
      payload: {
        turnId: editTurnId,
        widgetId: 'p_1',
        widget: {
          ...currentWidget,
          compressed: false,
        },
      },
    });
    // setTimeout(() => {
    dispatch({
      type: types.TURN_UPDATE_GEOMETRY,
      payload: {
        _id: data.item._id,
        size: {
          width: data.item.width,
          height: data.item.height,
        },
      },
    });
    // @todo: use paragraph stage
    const turnEl = document.querySelector(
      `.turn_${data.item._id} .stb-react-turn__inner`,
    );
    if (turnEl) {
      turnEl.style.height = `${data.item.height}px`;
    }
    // }, 300);
  });
};

export const updateScrollPosition = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_SCROLL,
    payload: data,
  });

export const clearScrollPositions = () => (dispatch) =>
  dispatch({
    type: types.TURNS_SCROLL_CLEAR,
  });

export const moveField = (data) => (dispatch, getState) => {
  const state = getState();
  const isSnapToGrid = true;
  const gameFieldMoveVector = isSnapToGrid
    ? {
        left: snapRound(data.left, GRID_CELL_X),
        top: snapRound(data.top, GRID_CELL_X),
      }
    : data;
  const viewportPrev = {
    position: {
      x: state.game.position.x,
      y: state.game.position.y,
    },
    size: {
      width: state.game.viewport.width,
      height: state.game.viewport.height,
    },
  };
  const viewport = {
    ...viewportPrev,
    position: {
      x: viewportPrev.position.x + gameFieldMoveVector.left,
      y: viewportPrev.position.y + gameFieldMoveVector.top,
    },
  };
  dispatch({
    type: gameTypes.GAME_FIELD_MOVE,
    payload: gameFieldMoveVector,
  });
  dispatch({
    type: types.TURNS_FIELD_WAS_MOVED,
    payload: viewport,
  });

  // проверка, нужно ли менять размеры поля ходов
  const screenArea = {
    position: {
      x: state.game.areaRect.left,
      y: state.game.areaRect.top,
    },
    size: {
      width: state.game.areaRect.width,
      height: state.game.areaRect.height,
    },
  };

  if (
    isBorderCoincides(viewportPrev, screenArea) ||
    isRectInsideArea(viewport, screenArea) !==
      isRectInsideArea(viewportPrev, screenArea)
  ) {
    dispatch({
      type: gameTypes.GAME_SCREEN_RECT_SET,
      payload: getBoundingAreaRect([...Object.values(state.turns.g), viewport]),
    });
  }
};

export const recalcAreaRect = () => (dispatch, getState) => {
  const state = getState();
  const viewport = state.game.viewport;
  const position = state.game.position;
  dispatch({
    type: gameTypes.GAME_SCREEN_RECT_SET,
    payload: getBoundingAreaRect([
      ...Object.values(state.turns.g),
      {
        position,
        size: viewport,
      },
    ]),
  });
};

export const createTurn = (turn, callbacks) => (dispatch) => {
  createTurnRequest(turn).then((data) => {
    dispatch({
      type: types.TURN_CREATE,
      payload: TurnHelper.toNewFields(data.item),
    });
    callbacks?.success(TurnHelper.toNewFields(data.item));
  });
};

export const deleteTurn = (_id) => (dispatch, getState) => {
  const state = getState();
  const allLines = Object.values(state.lines.d);
  const lines = filterLinesByTurnId(allLines, _id);
  dispatch(linesDelete(lines.map((line) => line._id))).then(() => {
    deleteTurnRequest(_id).then((data) => {
      dispatch({
        type: types.TURN_DELETE,
        payload: _id,
      });
    });
  });
};

export const resaveTurn = (turn, callbacks) => (dispatch) => {
  updateTurnRequest(turn._id, turn).then((data) => {
    const preparedTurn = {
      ...data.item,
      x: turn.x,
      y: turn.y,
    };
    dispatch({
      type: types.TURN_RESAVE,
      payload: TurnHelper.toNewFields(preparedTurn),
    });
    callbacks?.success();
  });
};

export const cloneTurn = (_id) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    try {
      const state = getState();
      const turnData = state.turns.d[_id];
      const turnGeometry = state.turns.g[_id];
      // @fixme
      const newFormatTurn = {
        ...turnData,
        position: turnGeometry.position,
        size: turnGeometry.size,
      };
      const turn = TurnHelper.toOldFields(newFormatTurn);
      const lines = Object.values(state.lines.d);
      const copiedTurn = dataCopy(turn);
      // @todo: проверить, откуда появляется _id в quotes
      copiedTurn.quotes = copiedTurn.quotes.map((quote) => ({
        id: quote.id,
        type: quote.type,
        text: quote.text, // @todo добавить это поле потом, сохранение по кнопке Save Turn
        x: quote.x,
        y: quote.y,
        height: quote.height,
        width: quote.width,
      }));

      copiedTurn.originalId = copiedTurn._id; // copiedTurn.originalId ||
      const copiedTurnId = copiedTurn._id;

      const { fieldsToClone } = turnSettings;

      fieldRemover(copiedTurn, fieldsToClone); // передали {ход} и [сохраняемые поля]

      const linesFieldsToKeep = [
        'sourceMarker',
        'sourceTurnId',
        'targetMarker',
        'targetTurnId',
        'type',
      ];

      const copiedLines = dataCopy(
        lines.filter(
          (line) =>
            line.sourceTurnId === copiedTurnId ||
            line.targetTurnId === copiedTurnId,
        ),
      );
      copiedLines.forEach((line) => fieldRemover(line, linesFieldsToKeep));

      saveTurnInBuffer({ copiedTurn, copiedLines }); // сохранили turn в LocalStorage

      dispatch(loadTurnsAndLinesToPaste());

      dispatch(
        addNotification({
          title: 'Info:',
          text: 'Turn was copied, ready to paste',
        }),
      );

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const insertTurnFromBuffer =
  (timeStamp, { successCallback, errorCallback }) =>
  (dispatch, getState) => {
    const state = getState();
    const timeStamps = getTimeStamps();
    const copiedTurnOldFormat = getTurnFromBufferAndRemove(
      timeStamp ? timeStamp : timeStamps[timeStamps.length - 1],
    );
    const copiedTurn = TurnHelper.toNewFields(copiedTurnOldFormat);
    const { pasteNextTurnPosition } = state.turns;
    const position = state.game.position;
    const viewport = state.game.viewport;
    copiedTurn.position = {};
    if (!!pasteNextTurnPosition) {
      copiedTurn.position.x = pasteNextTurnPosition.x;
      copiedTurn.position.y = pasteNextTurnPosition.y;
    } else {
      copiedTurn.position.x =
        position.x + Math.floor((viewport.width - copiedTurn.size.width) / 2);
      copiedTurn.position.y =
        position.y + Math.floor((viewport.height - copiedTurn.size.height) / 2);
    }

    if (!copiedTurn) {
      errorCallback('No turn in buffer');
      return false;
    }

    dispatch(loadTurnsAndLinesToPaste());

    if (timeStamps.length === 1) {
      dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: false }));
      dispatch(setPanelMode({ mode: MODE_GAME }));
    }
    // // @todo: get lines, connected with copied turn and display them
    dispatch(
      createTurn(TurnHelper.toOldFields(copiedTurn), {
        success: (turn) => {
          dispatch({
            type: types.TURN_NEXT_PASTE_POSITION,
            payload: {
              x: copiedTurn.position.x + copiedTurn.size.width + 40, // вставляет Paste Turn с промежутком от предыдущей вставки
              y: copiedTurn.position.y,
            },
          });
          dispatch(
            centerViewportAtPosition({
              x: copiedTurn.position.x + Math.floor(copiedTurn.size.width / 2),
              y: copiedTurn.position.y + Math.floor(copiedTurn.size.height / 2),
            }),
          );
          const turnId = copiedTurn.originalId;
          // оставить только те линии, которые связаны с turn по originalId
          const savedLinesToPaste = state.lines.linesToPaste;
          const sourceLines = []; // заменить sourceTurnId
          const targetLines = []; // заменить targetTurnId

          const turnsDict = state.turns.d;
          Object.keys(savedLinesToPaste)
            .filter((lineKey) => lineKey.indexOf(`${turnId}`) !== -1)
            .forEach((lineKey) => {
              // составить набор id из противоположных концов линий
              const line = savedLinesToPaste[lineKey];
              if (line.sourceTurnId === turnId) {
                sourceLines.push(line);
              } else {
                targetLines.push(line);
              }
            });
          // найти все шаги игры, которые имеют id или originalId из набора

          // ещё раз отфильтровать линии, оставить только те, что с двумя концами
          const lines = [];
          for (let sourceLine of sourceLines) {
            if (turnsDict[sourceLine.targetTurnId]) {
              // @learn массив есть и он не пустой

              lines.push({
                ...sourceLine,
                sourceTurnId: turn._id,
                targetTurnId: sourceLine.targetTurnId,
              });
            }
          }
          for (let targetLine of targetLines) {
            if (turnsDict[targetLine.sourceTurnId]) {
              // @learn массив есть и он не пустой

              lines.push({
                ...targetLine,
                targetTurnId: turn._id,
                sourceTurnId: targetLine.sourceTurnId,
              });
            }
          }
          if (!!lines.length) {
            dispatch(linesCreate(lines));
          }

          // преобразовать sourceTurnId и targetTurnId и вставить линии
        },
        errorCallback,
      }),
    );
  };

export const removeTurnFromBuffer = (timeStamp) => (dispatch) => {
  const timeStamps = getTimeStamps();
  getTurnFromBufferAndRemove(timeStamp);
  dispatch(loadTurnsAndLinesToPaste());
  if (timeStamps.length === 1) {
    dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: false }));
    dispatch(setPanelMode({ mode: MODE_GAME }));
  }
};

export const resetTurnNextPastePosition = () => (dispatch, getState) => {
  const state = getState();
  if (state.turns.pasteNextTurnPosition) {
    dispatch({ type: types.TURN_NEXT_PASTE_POSITION, payload: null });
  }
};

export const uploadImage = (image) => () => {
  return getTokenRequest('upload').then((data) => {
    const token = data.item;

    const formdata = new FormData();
    formdata.append('file', image);
    return fetch(`${STATIC_API_URL}/images/upload`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      method: 'POST',
      body: formdata,
    }).then((res) => res.json());
  });
};

import { getTurnsRequest } from '@/modules/game/requests';
import * as types from './types';
import * as gameTypes from '@/modules/game/game-redux/types';
import * as quotesTypes from '@/modules/quotes/redux/types';
import {
  createTurnRequest,
  deleteTurnRequest,
  getTokenRequest,
  updateTurnRequest,
} from '../requests';
import {
  dataCopy,
  fieldRemover,
  getTimeStamps,
  getTurnFromBufferAndRemove,
  saveTurnInBuffer,
} from '../components/helpers/dataCopier';
import turnSettings, { TURN_LOADING_FIXED } from '../settings';
import { addNotification } from '@/modules/ui/redux/actions';
import {
  centerViewportAtPosition,
  loadTurnsAndLinesToPaste,
} from '@/modules/game/game-redux/actions';
import { linesCreate, linesDelete } from '@/modules/lines/redux/actions';
import { filterLinesByTurnId } from '@/modules/lines/components/helpers/line';
import { setPanelMode, togglePanel } from '@/modules/panels/redux/actions';
import { MODE_GAME, PANEL_TURNS_PASTE } from '@/modules/panels/settings';

import { STATIC_API_URL } from '@/config/server';
import {
  COMP_ACTIVE,
  ORIG_ACTIVE,
} from '../components/widgets/paragraph/settings';
import {
  paragraphStateDeleteFromLocalStorage,
  paragraphStateGetFromLocalStorage,
} from '../components/helpers/store';
import { GRID_CELL_X, GRID_CELL_Y } from '@/config/ui';
import { isSnapToGridSelector, snapRound } from '../components/helpers/grid';
import { TurnHelper } from './helpers';

export const moveFieldToTopLeft = (turn) => (dispatch, getState) => {
  const state = getState();
  const isSnapToGrid = isSnapToGridSelector(state);
  const gameFieldMoveVector = isSnapToGrid
    ? {
        left: snapRound(turn.position.x, GRID_CELL_X),
        top: snapRound(turn.position.y, GRID_CELL_Y),
      }
    : { left: turn.position.x, top: turn.position.y };
  dispatch(moveField(gameFieldMoveVector));
};

export const resetCompressedParagraphState = (_id) => (dispatch, getState) => {
  const state = getState();
  const prevTurn = state.turns.d[_id];
  if (prevTurn.compressedParagraphState || prevTurn.compressedHeight) {
    dispatch({
      type: types.TURNS_UPDATE_GEOMETRY,
      payload: { compressedParagraphState: null, _id, compressedHeight: 0 },
    });
  }
  paragraphStateDeleteFromLocalStorage(_id);
};

export const loadTurns = (hash, viewport) => (dispatch, getState) => {
  getTurnsRequest(hash).then((data) => {
    const state = getState();
    const isSnapToGrid = isSnapToGridSelector(state);

    const quotesD = {};
    for (let turn of data.items) {
      if (!turn.quotes) continue;
      for (let quote of turn.quotes) {
        quotesD[`${turn._id}_${quote.id}`] = quote;
      }
    }
    dispatch({
      type: types.LOAD_TURNS,
      payload: {
        viewport: {
          position: {
            x: 0,
            y: 0,
          },
          size: {
            width: state.ui.viewport.width,
            height: state.ui.viewport.height,
          },
        },
        turns: data.items.map((turn) => {
          const compressedParagraphStateOld = paragraphStateGetFromLocalStorage(
            turn._id
          );
          const compressedParagraphState =
            compressedParagraphStateOld?.width === turn.width &&
            compressedParagraphStateOld?.updatedAt >=
              new Date(turn.updatedAt).getTime()
              ? compressedParagraphStateOld
              : null;
          return TurnHelper.toNewFields({
            ...turn,
            x: snapRound(turn.x - viewport.x, GRID_CELL_X),
            y: snapRound(turn.y - viewport.y, GRID_CELL_X),
            compressedParagraphState,
          });
        }),
      },
    });
    dispatch({
      type: quotesTypes.QUOTES_SET_DICTIONARY,
      payload: quotesD,
    });

    // const viewportNew = {
    //   // временный только для первой загрузки
    //   // x: state.game.position.left,
    //   x: -viewport.x,
    //   // y: state.game.position.top,
    //   y: -viewport.y,
    //   width: state.ui.viewport.width,
    //   height: state.ui.viewport.height,
    // };
    // dispatch({
    //   type: types.TURNS_FIELD_WAS_MOVED,
    //   payload: { left: 0, top: 0, viewport: viewportNew },
    // });
  });
};

// export const setParagraphIsReady = (_id, value) => (dispatch) =>
//   dispatch({
//     type: types.TURN_PARAGRAPH_SET_IS_READY,
//     payload: { _id, value },
//   });

export const updateGeometry = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_UPDATE_GEOMETRY,
    payload: data,
  });

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
  const activeTurn = state.turns.d[editTurnId];

  dispatch(
    changeTurnStage(editTurnId, TURN_LOADING_FIXED, {
      compressed: true,
      uncompressedHeight: activeTurn.height,
      paragraphStage: COMP_ACTIVE,
      // paragraphIsReady: false,
      // height: activeTurn.compressedHeight
    })
  );

  dispatch(markTurnAsChanged({ _id: editTurnId }));
};

export const unCompressParagraph = () => (dispatch, getState) => {
  const state = getState();
  const editTurnId = state.panels.editTurnId;
  const activeTurn = state.turns.d[editTurnId];

  dispatch(
    changeTurnStage(editTurnId, TURN_LOADING_FIXED, {
      compressed: false,
      compressedHeight: activeTurn.size.height,
      paragraphStage: ORIG_ACTIVE,
      height: activeTurn.size.height,
      // height: activeTurn.uncompressedHeight,
      // paragraphIsReady: false,
    })
  );
  // dispatch(
  //   updateGeometry({
  //     _id: editTurnId,
  //     compressed: false,
  //     compressedHeight: activeTurn.height,
  //     height: activeTurn.uncompressedHeight,
  //     paragraphIsReady: false,
  //   })
  //   );

  dispatch(markTurnAsChanged({ _id: editTurnId }));
};

export const updateScrollPosition = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_SCROLL,
    payload: data,
  });

export const moveField = (data) => (dispatch, getState) => {
  // getState сюда придёт сам, через механизм Redux Thunk

  // dispatch(moveField(123))

  // const dispatch = (arg) => {
  //   if (argIsObj) {
  //     //
  //   } else if (callable) {
  //     arg(dispatch, getState)
  //   }
  // }

  const state = getState();
  const isSnapToGrid = isSnapToGridSelector(state);
  const gameFieldMoveVector = isSnapToGrid
    ? {
        left: snapRound(data.left, GRID_CELL_X),
        top: snapRound(data.top, GRID_CELL_X),
      }
    : data;
  const viewport = {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: state.ui.viewport.width,
      height: state.ui.viewport.height,
    },
  };
  dispatch({
    type: gameTypes.GAME_FIELD_MOVE,
    payload: gameFieldMoveVector,
  });
  dispatch({
    type: types.TURNS_FIELD_WAS_MOVED,
    payload: { ...gameFieldMoveVector, viewport },
  });
};

export const createTurn = (turn, zeroPoint, callbacks) => (dispatch) => {
  createTurnRequest(turn).then((data) => {
    const preparedTurn = {
      ...data.item,
      x: turn.x + zeroPoint.position.x,
      y: turn.y + zeroPoint.position.y,
    };
    dispatch({
      type: types.TURN_CREATE,
      payload: TurnHelper.toNewFields(preparedTurn),
    });
    callbacks?.success(TurnHelper.toNewFields(data.item));
  });
};

export const deleteTurn = (_id) => (dispatch, getState) => {
  const state = getState();
  const lines = filterLinesByTurnId(state.lines.lines, _id);
  dispatch(linesDelete(lines.map((line) => line._id))).then(() => {
    deleteTurnRequest(_id).then((data) => {
      dispatch({
        type: types.TURN_DELETE,
        payload: _id,
      });
    });
  });
};

export const resaveTurn = (turn, zeroPoint, callbacks) => (dispatch) => {
  updateTurnRequest(turn._id, turn).then((data) => {
    paragraphStateDeleteFromLocalStorage(turn._id);
    const preparedTurn = {
      ...data.item,
      compressedHeight: 0,
      compressedParagraphState: null,
      x: turn.x + zeroPoint.position.x,
      y: turn.y + zeroPoint.position.y,
    };
    dispatch({
      type: types.TURN_RESAVE,
      payload: TurnHelper.toNewFields(preparedTurn),
    });
    dispatch({
      type: quotesTypes.QUOTES_UPDATE_DICTIONARY,
      payload: turn.quotes.reduce((acc, quote) => {
        return { ...acc, [`${turn._id}_${quote.id}`]: quote };
      }, {}),
    });
    callbacks?.success();
  });
};

export const cloneTurn = (newFormatTurn) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    try {
      const turn = TurnHelper.toOldFields(newFormatTurn);
      const state = getState();
      const lines = state.lines.lines;
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
            line.targetTurnId === copiedTurnId
        )
      );
      copiedLines.forEach((line) => fieldRemover(line, linesFieldsToKeep));

      saveTurnInBuffer({ copiedTurn, copiedLines }); // сохранили turn в LocalStorage

      dispatch(loadTurnsAndLinesToPaste());

      dispatch(
        addNotification({
          title: 'Info:',
          text: 'Turn was copied, ready to paste',
        })
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
      timeStamp ? timeStamp : timeStamps[timeStamps.length - 1]
    );
    const copiedTurn = TurnHelper.toNewFields(copiedTurnOldFormat);
    const { pasteNextTurnPosition } = state.turns;
    const position = state.game.position;
    const viewport = state.ui.viewport;
    copiedTurn.position = {};
    if (!!pasteNextTurnPosition) {
      copiedTurn.position.x = pasteNextTurnPosition.x;
      copiedTurn.position.y = pasteNextTurnPosition.y;
    } else {
      copiedTurn.position.x =
        position.left +
        Math.floor((viewport.width - copiedTurn.size.width) / 2);
      copiedTurn.position.y =
        position.top +
        Math.floor((viewport.height - copiedTurn.size.height) / 2);
    }

    if (!copiedTurn) {
      errorCallback('No turn in buffer');
      return false;
    }

    const zeroPointId = state.turns.zeroPointId;
    const zeroPoint = state.turns.d[zeroPointId];
    dispatch(loadTurnsAndLinesToPaste());

    if (timeStamps.length === 1) {
      dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: false }));
      dispatch(setPanelMode({ mode: MODE_GAME }));
    }

    // // @todo: get lines, connected with copied turn and display them
    dispatch(
      createTurn(TurnHelper.toOldFields(copiedTurn), zeroPoint, {
        success: (turn) => {
          console.log({ turn });
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
            })
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
      })
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

export const changeTurnStage = (_id, turnStage, params) => (dispatch) => {
  dispatch({
    type: types.TURN_SET_STAGE,
    payload: { _id, turnStage, ...params },
  });
};

export const changeParagraphStage = (_id, stage) => (dispatch) => {
  dispatch({
    type: types.TURN_PARAGRAPH_SET_STAGE,
    payload: { _id, stage },
  });
};

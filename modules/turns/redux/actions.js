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
import turnSettings from '../settings';
import { addNotification } from '@/modules/ui/redux/actions';
import {
  centerViewportAtPosition,
  loadTurnsAndLinesToPaste,
} from '@/modules/game/game-redux/actions';
import { linesCreate, linesDelete } from '@/modules/lines/redux/actions';
import { filterLinesByTurnId } from '@/modules/lines/components/helpers/line';
import {
  setPanelMode,
  toggleMinimizePanel,
  togglePanel,
} from '@/modules/panels/redux/actions';
import {
  MODE_GAME,
  PANEL_ADD_EDIT_TURN,
  PANEL_BUTTONS,
  PANEL_TURNS_PASTE,
} from '@/modules/panels/settings';

import { STATIC_API_URL } from '@/config/server';
import { panelReducer } from '@/modules/panels/redux/reducers';

export const loadTurns = (hash, viewport) => (dispatch) => {
  getTurnsRequest(hash).then((data) => {
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
        turns: data.items.map((turn) => ({
          ...turn,
          x: turn.x - viewport.x,
          y: turn.y - viewport.y,
        })),
      },
    });
    dispatch({
      type: quotesTypes.QUOTES_SET_DICTIONARY,
      payload: quotesD,
    });
  });
};

export const setParagraphIsReady = (_id, value) => (dispatch) =>
  dispatch({
    type: types.TURN_PARAGRAPH_SET_IS_READY,
    payload: { _id, value },
  });

export const updateGeometry = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_UPDATE_GEOMETRY,
    payload: data,
  });

export const markTurnAsChanged =
  ({ _id }) =>
  (dispatch) =>
    dispatch({
      type: types.TURN_WAS_CHANGED,
      payload: { _id },
    });

export const compressParagraph = () => (dispatch, getState) => {
  const state = getState();
  const editTurnId = state.panels.editTurnId;
  const activeTurn = state.turns.d[editTurnId];

  dispatch(
    updateGeometry({
      _id: editTurnId,
      compressed: true,
      uncompressedHeight: activeTurn.height,
      paragraphIsReady: false,
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
    updateGeometry({
      _id: editTurnId,
      compressed: false,
      compressedHeight: activeTurn.height,
      height: activeTurn.uncompressedHeight,
      paragraphIsReady: false,
    })
  );
  dispatch(markTurnAsChanged({ _id: editTurnId }));
};

export const updateScrollPosition = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_SCROLL,
    payload: data,
  });

export const moveField = (data) => (dispatch) => {
  dispatch({
    type: gameTypes.GAME_FIELD_MOVE,
    payload: data,
  });
  dispatch({
    type: types.TURNS_FIELD_WAS_MOVED,
    payload: data,
  });
};

export const createTurn = (turn, zeroPoint, callbacks) => (dispatch) => {
  createTurnRequest(turn).then((data) => {
    const preparedTurn = {
      ...data.item,
      x: turn.x + zeroPoint.x,
      y: turn.y + zeroPoint.y,
    };
    dispatch({
      type: types.TURN_CREATE,
      payload: preparedTurn,
    });
    callbacks?.success(data.item);
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
    const preparedTurn = {
      ...data.item,
      x: turn.x + zeroPoint.x,
      y: turn.y + zeroPoint.y,
    };
    dispatch({
      type: types.TURN_RESAVE,
      payload: preparedTurn,
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

export const cloneTurn = (turn) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    try {
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
    const copiedTurn = getTurnFromBufferAndRemove(
      timeStamp ? timeStamp : timeStamps[timeStamps.length - 1]
    );
    const { pasteNextTurnPosition } = state.turns;
    const position = state.game.position;
    const viewport = state.ui.viewport;
    if (!!pasteNextTurnPosition) {
      copiedTurn.x = pasteNextTurnPosition.x;
      copiedTurn.y = pasteNextTurnPosition.y;
    } else {
      copiedTurn.x =
        position.left + Math.floor((viewport.width - copiedTurn.width) / 2);
      copiedTurn.y =
        position.top + Math.floor((viewport.height - copiedTurn.height) / 2);
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
      createTurn(copiedTurn, zeroPoint, {
        success: (turn) => {
          dispatch({
            type: types.TURN_NEXT_PASTE_POSITION,
            payload: {
              x: copiedTurn.x + copiedTurn.width + 40, // вставляет Paste Turn с промежутком от предыдущей вставки
              y: copiedTurn.y,
            },
          });
          dispatch(
            centerViewportAtPosition({
              x: copiedTurn.x + Math.floor(copiedTurn.width / 2),
              y: copiedTurn.y + Math.floor(copiedTurn.height / 2),
            })
          );
          const turnId = copiedTurn.originalId;
          // оставить только те линии, которые связаны с turn по originalId
          const savedLinesToPaste = state.lines.linesToPaste;
          const sourceLines = [];
          const targetLines = [];

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
                targetTurnId: targetLine.sourceTurnId,
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

export const resetTurnNextPastePosition = () => (dispatch) => {
  dispatch({ type: types.TURN_NEXT_PASTE_POSITION, payload: null });
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

export const changeParagraphStage = (_id, stage) => (dispatch) => {
  dispatch({
    type: types.TURN_PARAGRAPH_SET_STAGE,
    payload: { _id, stage },
  });
};

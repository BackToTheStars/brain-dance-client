import { getTurnsRequest } from '@/modules/game/requests';
import * as types from './types';
import * as gameTypes from '@/modules/game/game-redux/types';
import * as quotesTypes from '@/modules/quotes/redux/types';
import {
  createTurnRequest,
  deleteTurnRequest,
  updateTurnRequest,
} from '../requests';
import {
  dataCopy,
  fieldRemover,
  getTurnFromBufferAndRemove,
  saveTurnInBuffer,
} from '../components/helpers/dataCopier';
import turnSettings from '../settings';
import { addNotification } from '@/modules/ui/redux/actions';
import { loadTurnsAndLinesToPaste } from '@/modules/game/game-redux/actions';

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

export const updateGeometry = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_UPDATE_GEOMETRY,
    payload: data,
  });

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
    callbacks?.success();
  });
};

export const deleteTurn = (_id) => (dispatch) => {
  deleteTurnRequest(_id).then((data) => {
    dispatch({
      type: types.TURN_DELETE,
      payload: _id,
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
      // e.preventDefault();

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

      // { title: 'Info:', text: 'Field has been saved' }
    } catch (err) {
      reject(err);
    }
  });
};

export const insertTurnFromBuffer =
  (timeStamp, { successCallback, errorCallback }) =>
  (dispatch) => {
    // const copiedTurn = getTurnFromBufferAndRemove(
    //   timeStamp ? timeStamp : timeStamps[timeStamps.length - 1]
    // );
    // if (!copiedTurn) {
    //   errorCallback('No turn in buffer');
    //   return false;
    // }
    // // @todo: get lines, connected with copied turn and display them
    // createTurn(copiedTurn, {
    //   successCallback: (data) => {
    //     const turn = data.item;
    //     // console.log({ copiedTurn,  turn, savedLinesToPaste });
    //     // оставить только те линии, которые связаны с turn по originalId
    //     const sourceLines = [];
    //     const targetLines = [];
    //     const turnsDict = {};
    //     const lineKeys = Object.keys(savedLinesToPaste)
    //       .filter((lineKey) => lineKey.indexOf(`${turn.originalId}`) !== -1)
    //       .forEach((lineKey) => {
    //         // составить набор id из противоположных концов линий
    //         const line = savedLinesToPaste[lineKey];
    //         if (line.sourceTurnId === turn.originalId) {
    //           sourceLines.push(line);
    //           turnsDict[line.targetTurnId] = [];
    //         } else {
    //           targetLines.push(line);
    //           turnsDict[line.sourceTurnId] = [];
    //         }
    //       });
    //     // найти все шаги игры, которые имеют id или originalId из набора
    //     // {
    //     //   <turnId>: [
    //     //     {_id: <turnId>, ...},
    //     //     {_id: <turnId2>, originalId: <turnId>...},
    //     //     {_id: <turnId3>, originalId: <turnId>...},
    //     //     {_id: <turnId4>, originalId: <turnId>...},
    //     //   ]
    //     // }
    //     for (let turn of turns) {
    //       if (turnsDict[turn._id]) {
    //         turnsDict[turn._id].push(turn);
    //       }
    //       if (turnsDict[turn.originalId]) {
    //         turnsDict[turn.originalId].push(turn);
    //       }
    //     }
    //     // ещё раз отфильтровать линии, оставить только те, что с двумя концами
    //     const lines = [];
    //     for (let sourceLine of sourceLines) {
    //       if (turnsDict[sourceLine.targetTurnId]?.length) {
    //         // @learn массив есть и он не пустой
    //         for (let targetTurn of turnsDict[sourceLine.targetTurnId]) {
    //           lines.push({
    //             ...sourceLine,
    //             sourceTurnId: turn._id,
    //             targetTurnId: targetTurn._id,
    //           });
    //         }
    //       }
    //     }
    //     for (let targetLine of targetLines) {
    //       if (turnsDict[targetLine.sourceTurnId]?.length) {
    //         // @learn массив есть и он не пустой
    //         for (let sourceTurn of turnsDict[targetLine.sourceTurnId]) {
    //           lines.push({
    //             ...targetLine,
    //             targetTurnId: turn._id,
    //             sourceTurnId: sourceTurn._id,
    //           });
    //         }
    //       }
    //     }
    //     !!lines.length &&
    //       createLines(lines, {
    //         successCallback: (data) => {
    //           turnsDispatch({ type: ACTION_LINES_CREATE, payload: data.items });
    //         },
    //       });
    //     // console.log(lines);
    //     // преобразовать sourceTurnId и targetTurnId и вставить линии
    //   },
    //   errorCallback,
    // });
  };

export const removeTurnFromBuffer = (timeStamp) => (dispatch) => {
  getTurnFromBufferAndRemove(timeStamp);
  dispatch(loadTurnsAndLinesToPaste());
};

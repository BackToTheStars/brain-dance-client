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
  saveTurnInBuffer,
} from '../components/helpers/dataCopier';
import turnSettings from '../settings';
import { addNotification } from '@/modules/ui/redux/actions';

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
        line.sourceTurnId === copiedTurnId || line.targetTurnId === copiedTurnId
    )
  );
  copiedLines.forEach((line) => fieldRemover(line, linesFieldsToKeep));

  saveTurnInBuffer({ copiedTurn, copiedLines }); // сохранили turn в LocalStorage

  dispatch(
    addNotification({
      title: 'Info:',
      text: 'Turn was copied, ready to paste',
    })
  );
  // { title: 'Info:', text: 'Field has been saved' }
};

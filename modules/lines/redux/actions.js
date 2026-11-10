import { createLinesRequest, deleteLinesRequest } from '../requests';
import * as types from './types';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';

// Записи цитат плоские, вложен только объект координат (initialCoords) — сравнение по полям
// на один уровень вглубь, без JSON.stringify: на шаге прокрутки меняются лишь рамки в окне,
// а свёрнутые у края цитаты (большинство у длинной статьи) остаются прежними объектами.
const sameValue = (a, b) => {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) if (!Object.is(a[key], b[key])) return false;
  return true;
};

const sameRecord = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) if (!sameValue(a[key], b[key])) return false;
  return true;
};

export const quoteCoordsUpdate =
  (turnId, widgetId, quotesWithCoords) => (dispatch, getState) => {
    const current = getState().lines.quotesInfo[turnId]?.[widgetId] || [];
    // прежняя запись — на том же месте (порядок записей — порядок узлов в теле), иначе по id;
    // одна цитата может дать несколько записей (span на строку у абзаца)
    let byId = null;
    const previousOf = (quote, i) => {
      if (current[i]?.quoteId === quote.quoteId) return current[i];
      if (!byId) {
        byId = new Map();
        for (const record of current) byId.set(record.quoteId, record);
      }
      return byId.get(quote.quoteId);
    };

    let unchanged = current.length === quotesWithCoords.length;
    const next = quotesWithCoords.map((quote, i) => {
      const previous = previousOf(quote, i);
      if (!sameRecord(quote, previous)) {
        unchanged = false;
        return quote;
      }
      if (previous !== current[i]) unchanged = false;
      return previous;
    });
    if (unchanged) return;

    return dispatch({
      type: types.LINES_QUOTE_COORDS_UPDATE,
      payload: { turnId, quotesWithCoords: next, widgetId },
    });
  };

export const lineDelete = (id) => (dispatch) => {
  deleteLinesRequest([id]).then((data) => {
    dispatch({
      type: types.LINE_DELETE,
      payload: { id },
    });
    dispatch(setActiveQuoteKey(null));
  });
};

export const linesDelete = (ids) => (dispatch) => {
  return new Promise((resolve, reject) => {
    if (!ids.length) return resolve(ids);
    deleteLinesRequest(ids).then((data) => {
      dispatch({
        type: types.LINES_DELETE,
        payload: { ids },
      });
      resolve(ids);
    });
  });
};

// Цитата ушла из хода — её координаты в quotesInfoByQuoteKey мёртвы: без
// чистки рамка держится в LogicLine/LinesPanel до перезагрузки.
export const clearQuotesInfo = (quoteKeys) => ({
  type: types.LINES_QUOTES_INFO_CLEAR,
  payload: { quoteKeys },
});

export const lineCreate = (line) => (dispatch) => {
  createLinesRequest({ lines: [line] }).then((data) => {
    dispatch({
      type: types.LINES_ADDED,
      payload: data.items,
    });
  });
};

export const linesCreate = (lines) => (dispatch) => {
  return createLinesRequest({ lines }).then((data) => {
    dispatch({
      type: types.LINES_ADDED,
      payload: data.items,
    });
  });
};

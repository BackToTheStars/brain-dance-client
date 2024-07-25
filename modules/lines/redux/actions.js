import { createLinesRequest, deleteLinesRequest } from '../requests';
import * as types from './types';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';

export const quoteCoordsUpdate =
  (turnId, widgetId, quotesWithCoords) => (dispatch, getState) => {
    const state = getState();
    const currentQuotesWithCoords = state.lines.quotesInfo[turnId]?.[widgetId];

    if (
      currentQuotesWithCoords?.length === quotesWithCoords.length &&
      JSON.stringify(currentQuotesWithCoords) ===
        JSON.stringify(quotesWithCoords)
    ) {
      return;
    }
    
    const d = (currentQuotesWithCoords || []).reduce((d, quote) => {
      d[quote.quoteId] = quote;

      return d;
    }, {});

    return dispatch({
      type: types.LINES_QUOTE_COORDS_UPDATE,
      payload: {
        turnId,
        quotesWithCoords: quotesWithCoords.map((newQuote) => {
          if (
            JSON.stringify(newQuote) === JSON.stringify(d[newQuote.quoteId])
          ) {
            return d[newQuote.quoteId];
          }

          return newQuote;
        }),
        widgetId,
      },
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

export const lineCreate = (line) => (dispatch) => {
  createLinesRequest({ lines: [line] }).then((data) => {
    dispatch({
      type: types.LINES_ADDED,
      payload: data.items,
    });
  });
};

export const linesCreate = (lines) => (dispatch) => {
  createLinesRequest({ lines }).then((data) => {
    dispatch({
      type: types.LINES_ADDED,
      payload: data.items,
    });
  });
};

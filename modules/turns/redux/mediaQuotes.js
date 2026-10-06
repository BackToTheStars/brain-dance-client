import * as types from './types';
import { updateTurnRequest } from '../requests';
import { TurnHelper } from './helpers';
import {
  clearQuotesInfo,
  linesDelete,
  quoteCoordsUpdate,
} from '@/modules/lines/redux/actions';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';
import { castSaved } from '@/modules/presence/redux/actions';
import {
  checkQuotes,
  quotesFromSegments,
  segmentsFromQuotes,
  turnQuoteIds,
} from '../components/helpers/timeline/quotes';

// Не в actions.js: castSaved тянет socket → refresh → actions.js, импорт оттуда замкнул бы цикл.
export const MEDIA_QUOTES = {
  audio: { widgetId: 'aq_1', field: 'audioQuotes', connectedTo: 'a_1' },
  video: { widgetId: 'vq_1', field: 'videoQuotes', connectedTo: 'v_1' },
};

// Лента целиком одной записью. quotes — [{ id, start, end, text }]; duration — из плеера, если он её
// знает, иначе берётся сохранённая. Пустой список снимает ленту (поле хода — null).
export const saveMediaQuotes =
  ({ turnId, kind, quotes = [], duration }) =>
  (dispatch, getState) => {
    const state = getState();
    const turn = state.turns.d[turnId];
    const target = MEDIA_QUOTES[kind];
    if (!turn || !target) {
      return Promise.reject(new Error(`no ${kind} quotes in turn ${turnId}`));
    }
    const { widgetId, field, connectedTo } = target;
    const prev = turn.dWidgets[widgetId];
    const total = duration > 0 ? duration : prev?.duration || 0;
    const problems = checkQuotes(quotes, total);
    if (problems.length) {
      return Promise.reject(Object.assign(new Error('invalid quotes'), { problems }));
    }

    const turnLines = state.lines.dByTurnIdAndMarker[turnId] || {};
    const segments = segmentsFromQuotes(quotes, total, {
      prevSegments: prev?.quotes || [],
      takenIds: turnQuoteIds(turn, Object.keys(turnLines)),
      now: Date.now(),
    });
    const kept = new Set(quotes.map((quote) => String(quote.id)));
    const removedIds = quotesFromSegments(prev?.quotes, prev?.duration)
      .map((quote) => quote.id)
      .filter((id) => !kept.has(String(id)));
    const lineIds = [
      ...new Set(removedIds.flatMap((id) => (turnLines[id] || []).map((line) => line._id))),
    ];
    const value = segments.length ? { connectedTo, duration: total, quotes: segments } : null;

    return dispatch(linesDelete(lineIds))
      .then(() => updateTurnRequest(turnId, { [field]: value }))
      .then((data) => {
        const widget = TurnHelper.timelineWidget(widgetId, data.item[field]);
        dispatch({ type: types.TURN_UPDATE_WIDGET, payload: { turnId, widgetId, widget } });

        const removedKeys = removedIds.map((id) => `${turnId}_${id}`);
        if (removedKeys.length) {
          const records = getState().lines.quotesInfo[turnId]?.[widgetId] || [];
          dispatch(
            quoteCoordsUpdate(
              turnId,
              widgetId,
              records.filter((record) => kept.has(String(record.quoteId))),
            ),
          );
          dispatch(clearQuotesInfo(removedKeys));
          if (removedKeys.includes(getState().quotes.activeQuoteKey)) {
            dispatch(setActiveQuoteKey(null));
          }
        }
        dispatch(castSaved());
        return { widget, removedQuoteIds: removedIds, deletedLineIds: lineIds };
      });
  };

import * as types from './types';

const initialLinesState = {
  quotesInfo: {},
  quotesInfoByQuoteKey: {},
  error: null,
  linesToPaste: {},
  d: {},
  dByTurnIdAndMarker: {},
};

const getDictionariesByLines = (lines) => {
  return {
    d: lines.reduce((acc, line) => {
      acc[line._id] = line;
      return acc;
    }, {}),
    dByTurnIdAndMarker: lines.reduce((acc, line) => {
      acc[line.sourceTurnId] = acc[line.sourceTurnId] || {};
      acc[line.sourceTurnId][line.sourceMarker] =
        acc[line.sourceTurnId][line.sourceMarker] || [];
      acc[line.sourceTurnId][line.sourceMarker].push(line);
      acc[line.targetTurnId] = acc[line.targetTurnId] || {};
      acc[line.targetTurnId][line.targetMarker] =
        acc[line.targetTurnId][line.targetMarker] || [];
      acc[line.targetTurnId][line.targetMarker].push(line);
      return acc;
    }, {}),
  };
};

export const linesReducer = (state = initialLinesState, { type, payload }) => {
  switch (type) {
    case types.LINES_LOAD: {
      return {
        ...state,
        ...getDictionariesByLines(payload),
      };
    }

    case types.LINES_ADDED: {
      const newLines = Object.values(state.d);
      newLines.push(...payload);
      return {
        ...state,
        ...getDictionariesByLines(newLines),
      };
    }

    case types.LINE_DELETE: {
      const d = { ...state.d };
      delete d[payload.id];
      const newLines = Object.values(d);
      return {
        ...state,
        ...getDictionariesByLines(newLines),
      };
    }

    case types.LINES_DELETE: {
      const dLines = state.d;
      const newLines = [];
      for (let oldLine of Object.values(dLines)) {
        if (!payload.ids.includes(oldLine._id)) {
          newLines.push(oldLine);
        }
      }
      return {
        ...state,
        ...getDictionariesByLines(newLines),
      };
    }

    case types.LINES_QUOTE_COORDS_UPDATE: {
      const { turnId, quotesWithCoords, widgetId } = payload;
      // по ключу — последняя запись с ним; в словарь переписываются только изменившиеся
      // объекты (прежние приходят теми же — см. quoteCoordsUpdate)
      const last = {};
      for (const quote of quotesWithCoords) last[quote.quoteKey] = quote;
      let quotesInfoByQuoteKey = state.quotesInfoByQuoteKey;
      for (const key of Object.keys(last)) {
        if (quotesInfoByQuoteKey[key] === last[key]) continue;
        if (quotesInfoByQuoteKey === state.quotesInfoByQuoteKey) {
          quotesInfoByQuoteKey = { ...state.quotesInfoByQuoteKey };
        }
        quotesInfoByQuoteKey[key] = last[key];
      }
      return {
        ...state,
        quotesInfo: {
          ...state.quotesInfo,
          [turnId]: {
            ...(state.quotesInfo[turnId] || {}),
            [widgetId]: quotesWithCoords,
          },
        },
        quotesInfoByQuoteKey,
      };
    }

    case types.LINES_QUOTES_INFO_CLEAR: {
      const quotesInfoByQuoteKey = { ...state.quotesInfoByQuoteKey };
      for (const key of payload.quoteKeys) delete quotesInfoByQuoteKey[key];
      return { ...state, quotesInfoByQuoteKey };
    }

    case types.LINES_LOAD_TO_PASTE: {
      return { ...state, linesToPaste: payload.linesToPaste };
    }

    default:
      return state;
  }
};

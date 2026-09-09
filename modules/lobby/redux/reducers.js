import * as types from './types';

// загрузка/ошибка/пусто у списков лобби раньше не различались: пустой список
// рисовал тот же <Loading/>, а отказ /lobby/* не показывался никак
const initialRequestStatus = { loading: true, error: null };

const initialState = {
  games: [],
  dGames: {},
  gamesStatus: initialRequestStatus,
  turnsStatus: initialRequestStatus,
  sliderModal: { open: false, type: null, params: {} },
  textSettings: {
    columnCount: 3,
    limitLineHeader: 2,
    lineCount: 10,
    fontSize: 16,
    lineSpacing: 1.5,
    padding: 12,
    alignment: 'left',
  },
  dictionaryGame: {},
  turns: [],
  dTurns: {},
  mode: 'chrono', // 'byGame',
  requestSettings: {
    gameLimit: 5,
    turnLimit: 5,
    pinned: false,
  }
};

export const lobbyReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOBBY_TEXT_SETTINGS_LOAD: {
      return {
        ...state,
        textSettings: payload,
      };
    }
    case types.LOBBY_TEXT_SETTINGS_SET: {
      return {
        ...state,
        textSettings: {
          ...state.textSettings,
          [payload.field]: payload.value,
        },
      };
    }
    case types.LOBBY_REQUEST_SETTINGS_SET: {
      return {
        ...state,
        requestSettings: {
          ...state.requestSettings,
          [payload.field]: payload.value,
        },
      };
    }
    case types.LOBBY_SLIDER_MODAL_SET: {
      return {
        ...state,
        sliderModal: payload,
      };
    }
    case types.LOBBY_GAMES_REQUEST: {
      return {
        ...state,
        gamesStatus: { loading: true, error: null },
      };
    }
    case types.LOBBY_GAMES_ERROR: {
      return {
        ...state,
        gamesStatus: { loading: false, error: payload },
      };
    }
    case types.LOBBY_GAMES_LOAD: {
      return {
        ...state,
        games: payload.items,
        dGames: payload.d,
        gamesStatus: { loading: false, error: null },
      };
    }
    case types.LOBBY_TURNS_REQUEST: {
      return {
        ...state,
        turnsStatus: { loading: true, error: null },
      };
    }
    case types.LOBBY_TURNS_ERROR: {
      return {
        ...state,
        turnsStatus: { loading: false, error: payload },
      };
    }
    case types.LOBBY_TURNS_LOAD: {
      return {
        ...state,
        turns: payload,
        dTurns: payload.reduce((acc, t) => {
          acc[t._id] = t;
          return acc;
        }, {}),
        turnsStatus: { loading: false, error: null },
      };
    }
    case types.LOBBY_MODE_SET: {
      return {
        ...state,
        mode: payload,
      };
    }
  }
  return state;
};

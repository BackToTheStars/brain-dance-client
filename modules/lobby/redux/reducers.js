import { FONT_INTER } from '@/config/lobby/fonts';
import * as types from './types';

const initialState = {
  games: [],
  dGames: {},
  modal: { open: false, type: null, params: {} },
  sliderModal: { open: false, type: null, params: {} },
  textSettings: {
    limitLineHeader: 2,
    lineCount: 10,
    fontSize: 16,
    lineSpacing: 1.5,
    padding: 12,
    alignment: 'left',
    activeFontFamily: FONT_INTER,
  },
  layoutSettings: {
    desiredNumCols: 2,
  },
  dictionaryGame: {},
  sidebar: {},
  turns: [],
  theme: '',
  mode: 'byGame',
};

export const lobbyReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOBBY_TEXT_SETTINGS_SET: {
      return {
        ...state,
        textSettings: {
          ...state.textSettings,
          [payload.field]: payload.value,
        },
      };
    }
    case types.LOBBY_LAYOUT_SETTINGS_SET: {
      return {
        ...state,
        layoutSettings: {
          ...state.layoutSettings,
          [payload.field]: payload.value,
        },
      };
    }
    case types.LOBBY_MODAL_SET: {
      return {
        ...state,
        modal: payload,
      };
    }
    case types.LOBBY_SLIDER_MODAL_SET: {
      return {
        ...state,
        sliderModal: payload,
      };
    }
    case types.LOBBY_GAMES_LOAD: {
      return {
        ...state,
        games: payload.items,
        dGames: payload.d,
      };
    }
    case types.LOBBY_TURNS_LOAD: {
      return {
        ...state,
        turns: payload,
      };
    }
    case types.LOBBY_SIDEBAR: {
      return {
        ...state,
        sidebar: payload,
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

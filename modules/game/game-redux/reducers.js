import { GAME_STAGE_INIT } from '@/config/game';
import * as types from './types';

const initialGameState = {
  stage: GAME_STAGE_INIT,
  game: null,
  position: { x: 0, y: 0 },
  viewport: { width: 1600, height: 1200 },
  areaRect: { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 },
  error: null,
  cancelCallback: () => {},
};

export const gameReducer = (state = initialGameState, { type, payload }) => {
  switch (type) {
    case types.GAME_LOAD:
      return {
        ...state,
        game: payload,
        // позицию кладёт только loadFullGame; loadShortGame (диалог входа)
        // отдаёт игру без неё — и не должен обнулять уже вычисленную
        position: payload.position || state.position,
      };

    // Правка игры из панели Info: ответ `PUT /game` — это ЧАСТЬ игры (name,
    // description, public, image, hash), без position, codes, lines и auth.
    // Через GAME_LOAD он заменял бы `game` целиком: позиция поля становилась
    // undefined, и каждый TurnAdapter падал на `gamePosition.x`.
    case types.GAME_UPDATE:
      return {
        ...state,
        game: { ...state.game, ...payload },
      };

    case types.GAME_FIELD_MOVE: {
      return {
        ...state,
        position: {
          x: state.position.x + payload.left,
          y: state.position.y + payload.top,
        },
      };
    }

    case types.GAME_CREATE_CANCEL_CALLBACK:
      return {
        ...state,
        cancelCallback: payload,
      };

    case types.GAME_SCREEN_RECT_SET:
      return {
        ...state,
        areaRect: payload,
      };

    case types.GAME_STAGE_SET:
      return {
        ...state,
        stage: payload,
      };

    case types.GAME_VIEWPORT_SET:
      return {
        ...state,
        viewport: payload,
      };

    default:
      return state;
  }
};

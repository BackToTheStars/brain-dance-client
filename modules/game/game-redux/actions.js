import { getGameRequest, updateGameRequest } from '@/modules/game/requests';
import * as turnsTypes from '@/modules/turns/redux/types';
import * as linesTypes from '@/modules/lines/redux/types';
import * as types from './types';
import {
  getTurnsGeometryRequest,
  updateCoordinatesRequest,
  updateScrollPositionsRequest,
} from '@/modules/turns/requests';
import { addNotification } from '@/modules/ui/redux/actions';
import { clearScrollPositions, loadTurnsGeometry, moveField } from '@/modules/turns/redux/actions';
import {
  getLinesNotExpired,
  getTurnsFromBuffer,
} from '@/modules/turns/components/helpers/dataCopier';
import { resetAndExit, setPanels } from '@/modules/panels/redux/actions';
import { GRID_CELL_X, GRID_CELL_Y } from '@/config/ui';
import { snapRound } from '@/modules/turns/components/helpers/grid';
import { getGameSettings, updateGameSettings } from './storage';
import {
  getPersonalizedPanelSettings,
  savePanelsSettings,
} from '@/modules/panels/redux/storage';

export const setGameStage = (stage) => (dispatch, getState) => {
  const state = getState();
  if (state.game.stage === stage) return;
  dispatch({ type: types.GAME_STAGE_SET, payload: stage });
};

export const loadShortGame = (hash) => (dispatch) => {
  return new Promise((resolve) => {
    getGameRequest(hash).then((data) => {
      dispatch({
        type: types.GAME_LOAD,
        payload: data.item,
      });
      resolve(data.item);
    });
  });
};

// Стартовая позиция вьюпорта: центр хода из ссылки (?turn=) поверх сохранённых
// настроек игры; при неизвестном ходе — тихий откат на сохранённую позицию.
const resolveStartPosition = (hash, focusTurnId, getState) => {
  const { position: savedPosition } = getGameSettings(hash);
  if (!focusTurnId) {
    return Promise.resolve(savedPosition);
  }
  return getTurnsGeometryRequest(hash)
    .then((data) => {
      const turn = data.items.find((item) => item._id === focusTurnId);
      if (!turn) return savedPosition;
      const viewport = getState().game.viewport;
      const viewportWidth = viewport.width || window.innerWidth;
      const viewportHeight = viewport.height || window.innerHeight;
      return {
        x:
          turn.position.x +
          Math.floor(turn.size.width / 2) -
          Math.floor(viewportWidth / 2),
        y:
          turn.position.y +
          Math.floor(turn.size.height / 2) -
          Math.floor(viewportHeight / 2),
      };
    })
    .catch(() => savedPosition);
};

export const loadFullGame =
  (hash, { focusTurnId = null } = {}) =>
  (dispatch, getState) => {
    // GET GAME DATA
    return new Promise((resolve, reject) => {
      const d = getState().panels.d;
      const personalizedPanels = getPersonalizedPanelSettings(hash, d);
      dispatch(setPanels({ d: personalizedPanels }));
      getGameRequest(hash).then((data) => {
        resolveStartPosition(hash, focusTurnId, getState).then(({ x, y }) => {
          const position = {
            x: snapRound(x, GRID_CELL_X),
            y: snapRound(y, GRID_CELL_X),
          };
          dispatch({
            type: types.GAME_LOAD,
            payload: { ...data.item, position },
          });

          dispatch({
            type: linesTypes.LINES_LOAD,
            payload: data.item.lines,
          });

          dispatch(loadTurnsGeometry(hash, position)).then(() => {
            resolve();
          });
        });
      });
    });
  };

// Сохранённая позиция поля обязана побеждать при перезагрузке, а `?turn=` из
// ссылки её перебивает: resolveStartPosition центрирует ход поверх сохранённого.
// Поэтому после сохранения параметр уходит из адреса — без перезагрузки и не
// трогая остальные параметры. Next патчит history.replaceState, так что
// useSearchParams узнает об этом сам; перерисовка холста от этого не зависит —
// focusTurnId читается один раз, на монтировании.
const dropTurnFromUrl = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('turn')) return;
  url.searchParams.delete('turn');
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
};

export const saveField = () => (dispatch, getState) => {
  const state = getState();
  const hash = state.game.game.hash;
  const g = state.turns.g;
  const gamePosition = state.game.position;
  const isSnapToGrid = true;
  const scrollPositions = Object.values(state.turns.scrollPositions);

  const changedTurns = Object.values(g)
    .filter((turn) => {
      if (turn.wasChanged) return true;
      if (isSnapToGrid) {
        if (
          turn.position.x % GRID_CELL_X !== 0 ||
          turn.position.y % GRID_CELL_X !== 0
        )
          return true;
        if (
          turn.size.width % GRID_CELL_X !== 0 ||
          turn.size.height % GRID_CELL_Y !== 0
        )
          return true;
      }
      return false;
    })
    .map((turn) => {
      return {
        _id: turn._id,
        x: snapRound(turn.position.x, GRID_CELL_X),
        y: snapRound(turn.position.y, GRID_CELL_X),
        width: snapRound(turn.size.width, GRID_CELL_X),
        height: snapRound(turn.size.height, GRID_CELL_Y),
      };
    }); // ход был изменён, сохранить только его

  const turnsWithUpdatedGeometry = changedTurns.map((turn) => {
    return {
      _id: turn._id,
      position: { x: turn.x, y: turn.y },
      size: { width: turn.width, height: turn.height },
      wasChanged: false,
    };
  });

  updateCoordinatesRequest(changedTurns).then((data) => {
    dispatch({
      type: turnsTypes.TURNS_UPDATE_GEOMETRY,
      payload: {
        turns: turnsWithUpdatedGeometry,
      },
    });
    dispatch({ type: turnsTypes.TURNS_SYNC_DONE });
    dispatch(addNotification({ title: 'Info:', text: 'Field has been saved' }));
    dispatch(resetAndExit());
  });
  updateGameSettings(hash, 'position', gamePosition);
  dropTurnFromUrl();
  savePanelsSettings(hash, state.panels.d);
  if (scrollPositions.length) {
    updateScrollPositionsRequest(scrollPositions)
      .then(() => {
        dispatch(clearScrollPositions());
      })
  }
};

// Стор обязан повторять буфер, в том числе когда буфер опустел: по
// `turns.turnsToPaste` рисуется кнопка «Paste Turn» в игровом режиме
// (GameMode.js) и таблица PasteTurnPanel. Раньше пустой результат не
// доезжал до стора (`if (turnsToPaste.length)`), поэтому после вставки
// последнего хода кнопка оставалась висеть.
export const loadTurnsAndLinesToPaste = () => (dispatch) => {
  dispatch({
    type: turnsTypes.TURNS_LOAD_TO_PASTE,
    payload: { turnsToPaste: getTurnsFromBuffer() },
  });
  dispatch({
    type: linesTypes.LINES_LOAD_TO_PASTE,
    payload: { linesToPaste: getLinesNotExpired() },
  });
};

export const reloadTurnsToPaste = () => (dispatch) => {
  const turnsToPaste = getTurnsFromBuffer();
  dispatch({
    type: turnsTypes.TURNS_LOAD_TO_PASTE,
    payload: { turnsToPaste },
  });
}

export const centerViewportAtPosition =
  ({ x, y }) =>
  (dispatch, getState) => {
    const state = getState();
    const position = state.game.position;
    const viewport = state.game.viewport;

    const left = position.x - x + Math.floor(viewport.width / 2);
    const top = position.y - y + Math.floor(viewport.height / 2);

    if (typeof $ === 'undefined') return;

    const gameBoxEl = $('#game-box');

    gameBoxEl.addClass('remove-line-transition');
    gameBoxEl.animate(
      {
        left: `${left}px`,
        top: `${top}px`,
      },
      300,
      () => {
        dispatch(
          moveField({
            left: -left,
            top: -top,
          }),
        );
        gameBoxEl.css('left', 0);
        gameBoxEl.css('top', 0);
        setTimeout(() => {
          gameBoxEl.removeClass('remove-line-transition');
        }, 100);
      },
    );
  };

export const createCancelCallback = (callback) => (dispatch) => {
  dispatch({ type: types.GAME_CREATE_CANCEL_CALLBACK, payload: callback });
};

export const updateViewportGeometry = (viewport) => (dispatch, getState) => {
  const state = getState();
  if (
    !viewport ||
    (viewport.width === state.game.viewport.width &&
      viewport.height === state.game.viewport.height)
  ) {
    return;
  }
  dispatch({
    type: types.GAME_VIEWPORT_SET,
    payload: viewport,
  });
};

// Правка игры из панели Info. `PUT /game` отвечает частью игры — name,
// description, public, image, hash, — без position, codes, lines и auth,
// поэтому кладём её слиянием (GAME_UPDATE), а не заменой (GAME_LOAD).
// `_id` из ответа не берём: `GET /game` его намеренно не отдаёт, и в сторе
// его никогда не было.
export const updateGame = (data) => (dispatch) => {
  return new Promise((resolve) => {
    updateGameRequest(data).then((data) => {
      const { _id, ...game } = data.item;
      dispatch({
        type: types.GAME_UPDATE,
        payload: game,
      });

      resolve(data.item);
    });
  });
};

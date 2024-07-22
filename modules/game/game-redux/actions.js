import { getGameRequest, updateGameRequest } from '@/modules/game/requests';
import * as turnsTypes from '@/modules/turns/redux/types';
import * as linesTypes from '@/modules/lines/redux/types';
import * as types from './types';
import { updateCoordinatesRequest, updateScrollPositionsRequest } from '@/modules/turns/requests';
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

export const loadFullGame = (hash) => (dispatch, getState) => {
  // GET GAME DATA
  return new Promise((resolve, reject) => {
    const {
      position: { x, y },
    } = getGameSettings(hash);
    const d = getState().panels.d;
    const personalizedPanels = getPersonalizedPanelSettings(hash, d);
    dispatch(setPanels({ d: personalizedPanels }));
    getGameRequest(hash).then((data) => {
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
  savePanelsSettings(hash, state.panels.d);
  if (scrollPositions.length) {
    updateScrollPositionsRequest(scrollPositions)
      .then(() => {
        dispatch(clearScrollPositions());
      })
  }
};

export const loadTurnsAndLinesToPaste = () => (dispatch) => {
  const turnsToPaste = getTurnsFromBuffer();
  if (turnsToPaste.length) {
    dispatch({
      type: turnsTypes.TURNS_LOAD_TO_PASTE,
      payload: { turnsToPaste },
    });
  }
  const linesToPaste = getLinesNotExpired();
  if (Object.keys(linesToPaste).length) {
    dispatch({
      type: linesTypes.LINES_LOAD_TO_PASTE,
      payload: { linesToPaste },
    });
  }
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

export const updateGame = (data) => (dispatch) => {
  return new Promise((resolve) => {
    updateGameRequest(data).then((data) => {
      dispatch({
        type: types.GAME_LOAD,
        payload: data.item,
      });

      resolve(data.item);
    });
  });
};

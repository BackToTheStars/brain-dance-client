import {
  getGameRequest,
  saveGamePositionRequest,
} from '@/modules/game/requests';
import * as turnsTypes from '@/modules/turns/redux/types';
import * as linesTypes from '@/modules/lines/redux/types';
import * as types from './types';
import { updateCoordinatesRequest } from '@/modules/turns/requests';
import { addNotification } from '@/modules/ui/redux/actions';
import { loadTurnsGeometry, moveField } from '@/modules/turns/redux/actions';
import {
  getLinesNotExpired,
  getTurnsFromBuffer,
} from '@/modules/turns/components/helpers/dataCopier';
import { resetAndExit } from '@/modules/panels/redux/actions';
import { GRID_CELL_X, GRID_CELL_Y } from '@/config/ui';
import {
  isSnapToGridSelector,
  snapRound,
} from '@/modules/turns/components/helpers/grid';
import { TurnHelper } from '@/modules/turns/redux/helpers';

export const setGameStage = (stage) => (dispatch, getState) => {
  const state = getState();
  if (state.game.stage === stage) return;
  dispatch({ type: types.GAME_STAGE_SET, payload: stage });
};

export const loadFullGame = (hash) => (dispatch, getState) => {
  // GET GAME DATA
  return new Promise((resolve, reject) => {
    getGameRequest(hash).then((data) => {
      const position = {
        x: snapRound(data.item.viewportPointX, GRID_CELL_X),
        y: snapRound(data.item.viewportPointY, GRID_CELL_X),
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
  const d = state.turns.d; // @fixme
  const g = state.game.g;
  const gamePosition = state.game.position;
  const isSnapToGrid = isSnapToGridSelector(state);

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
      const {
        _id,
        x,
        y,
        height,
        compressed,
        compressedHeight,
        uncompressedHeight,
        width,
        scrollPosition,
      } = TurnHelper.toOldFields(turn);
      const coords = {
        x: x + gamePosition.left,
        y: y + gamePosition.top,
        height,
        width,
      };
      if (isSnapToGrid) {
        coords.x = snapRound(coords.x, GRID_CELL_X);
        coords.y = snapRound(coords.y, GRID_CELL_X);
        coords.width = snapRound(coords.width, GRID_CELL_X);
        coords.height = snapRound(coords.height, GRID_CELL_Y);
      }
      return {
        _id,
        ...coords,
        compressed,
        compressedHeight,
        uncompressedHeight,
        scrollPosition,
      };
    }); // ход был изменён, сохранить только его

  updateCoordinatesRequest(changedTurns).then((data) => {
    for (const turn of changedTurns) {
      // @todo: оптимизировать
      dispatch({
        type: turnsTypes.TURNS_UPDATE_GEOMETRY,
        payload: TurnHelper.toNewFields({
          ...TurnHelper.toOldFields(d[turn._id]),
          ...turn,
          x: turn.x - state.game.position.left,
          y: turn.y - state.game.position.top,
        }),
      });
    }
    dispatch({ type: turnsTypes.TURNS_SYNC_DONE });
    dispatch(addNotification({ title: 'Info:', text: 'Field has been saved' }));
    dispatch(resetAndExit());
  });

  saveGamePositionRequest(gamePosition);
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

export const centerViewportAtPosition =
  ({ x, y }) =>
  (dispatch, getState) => {
    const state = getState();
    const position = state.game.position;
    const viewport = state.game.viewport;

    const left = position.x - x + Math.floor(viewport.width / 2);
    const top = position.y - y + Math.floor(viewport.height / 2);

    if (typeof $ === 'undefined') return;

    const gameBoxEl = $('#gameBox');

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
          })
        );
        gameBoxEl.css('left', 0);
        gameBoxEl.css('top', 0);
        setTimeout(() => {
          gameBoxEl.removeClass('remove-line-transition');
        }, 100);
      }
    );
  };

export const switchEditMode = (booleanValue) => (dispatch) => {
  dispatch({ type: types.GAME_EDIT_MODE_SWITCH, payload: booleanValue });
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

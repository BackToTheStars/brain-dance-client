import {
  getGameRequest,
  saveGamePositionRequest,
} from '@/modules/game/requests';
import * as turnsTypes from '@/modules/turns/redux/types';
import * as linesTypes from '@/modules/lines/redux/types';
import * as types from './types';
import { updateCoordinatesRequest } from '@/modules/turns/requests';
import { addNotification } from '@/modules/ui/redux/actions';
import { loadTurns, moveField } from '@/modules/turns/redux/actions';
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

export const loadFullGame = (hash) => (dispatch, getState) => {
  // GET GAME DATA
  getGameRequest(hash).then((data) => {
    const state = getState();
    const isSnapToGrid = isSnapToGridSelector(state);
    const viewport = isSnapToGrid
      ? {
          x: snapRound(data.item.viewportPointX, GRID_CELL_X),
          y: snapRound(data.item.viewportPointY, GRID_CELL_X),
        }
      : {
          x: data.item.viewportPointX,
          y: data.item.viewportPointY,
        };

    dispatch({
      type: types.LOAD_GAME,
      payload: { ...data.item, ...viewport },
    });

    dispatch({
      type: linesTypes.LINES_LOAD,
      payload: data.item.lines,
    });

    dispatch(loadTurns(hash, viewport));

    // GET TURNS DATA
    // getTurnsRequest(hash).then((data) => {
    //   dispatch({
    //     type: turnsTypes.LOAD_TURNS,
    //     payload: {
    //       turns: data.items.map((turn) => ({
    //         ...turn,
    //         x: turn.x - viewport.x,
    //         y: turn.y - viewport.y,
    //       })),
    //     },
    //   });
    // });
  });
};

export const saveField =
  (d, zeroPoint, gamePosition) => (dispatch, getState) => {
    //
    const state = getState();
    const isSnapToGrid = isSnapToGridSelector(state);

    const changedTurns = Object.values(d)
      .filter((turn) => {
        if (turn.wasChanged) return true;
        if (isSnapToGrid) {
          if (turn.x % GRID_CELL_X !== 0 || turn.y % GRID_CELL_X !== 0)
            return true;
          if (turn.width % GRID_CELL_X !== 0 || turn.height % GRID_CELL_Y !== 0)
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
        } = turn;
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
      // for (const turn of data.items) {
      for (const turn of changedTurns) {
        dispatch({
          type: turnsTypes.TURNS_UPDATE_GEOMETRY,
          payload: {
            ...turn,
            x: turn.x - state.game.position.left,
            y: turn.y - state.game.position.top,
          },
        });
      }
      dispatch({ type: turnsTypes.TURNS_SYNC_DONE });
      dispatch(
        addNotification({ title: 'Info:', text: 'Field has been saved' })
      );
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
    const viewport = state.ui.viewport;

    const left = position.left - x + Math.floor(viewport.width / 2);
    const top = position.top - y + Math.floor(viewport.height / 2);

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

import {
  getGameRequest,
  getTurnsRequest,
  saveGamePositionRequest,
} from '@/modules/game/requests';
import * as turnsTypes from '@/modules/turns/redux/types';
import * as linesTypes from '@/modules/lines/redux/types';
import * as types from './types';
import {
  updateCoordinates,
  updateCoordinatesRequest,
} from '@/modules/turns/requests';
import { addNotification } from '@/modules/ui/redux/actions';
import { loadTurns, moveField } from '@/modules/turns/redux/actions';
import {
  getLinesNotExpired,
  getTimestampsNotExpired,
  getTurnsFromBuffer,
} from '@/modules/turns/components/helpers/dataCopier';
import { resetAndExit } from '@/modules/panels/redux/actions';

export const loadFullGame = (hash) => (dispatch) => {
  // GET GAME DATA
  getGameRequest(hash).then((data) => {
    dispatch({
      type: types.LOAD_GAME,
      payload: data.item,
    });

    dispatch({
      type: linesTypes.LINES_LOAD,
      payload: data.item.lines,
    });

    const viewport = {
      x: data.item.viewportPointX,
      y: data.item.viewportPointY,
    };

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

export const saveField = (d, zeroPoint, gamePosition) => (dispatch) => {
  //
  const changedTurns = Object.values(d)
    .filter((turn) => turn.wasChanged === true)

    .map((turn) => {
      const { _id, x, y, height, width, scrollPosition } = turn;
      return {
        _id,
        x: x + gamePosition.left,
        y: y + gamePosition.top,
        height,
        width,
        scrollPosition,
      };
    }); // ход был изменён, сохранить только его

  updateCoordinatesRequest(changedTurns).then((data) => {
    dispatch({ type: turnsTypes.TURNS_SYNC_DONE });
    dispatch(addNotification({ title: 'Info:', text: 'Field has been saved' }));
    dispatch(resetAndExit());
  });

  saveGamePositionRequest(gamePosition);
};

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

export const centerViewportAtPosition =
  ({ x, y }) =>
  (dispatch, getState) => {
    const state = getState();
    const position = state.game.position;
    const viewport = state.ui.viewport;

    const left = position.left - x + Math.floor(viewport.width / 2);
    const top = position.top - y + Math.floor(viewport.height / 2);

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

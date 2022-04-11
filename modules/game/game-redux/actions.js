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

export const loadFullGame = (hash) => (dispatch) => {
  // GET GAME DATA
  getGameRequest(hash).then((data) => {
    dispatch({
      type: types.LOAD_GAME,
      payload: data.item,
    });

    dispatch({
      type: linesTypes.LOAD_LINES,
      payload: data.item.lines,
    });

    const viewport = {
      x: data.item.viewportPointX,
      y: data.item.viewportPointY,
    };

    // GET TURNS DATA
    getTurnsRequest(hash).then((data) => {
      dispatch({
        type: turnsTypes.LOAD_TURNS,
        payload: {
          turns: data.items.map((turn) => ({
            ...turn,
            x: turn.x - viewport.x,
            y: turn.y - viewport.y,
          })),
        },
      });
    });
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
        x: x - zeroPoint.x,
        y: y - zeroPoint.y,
        height,
        width,
        scrollPosition,
      };
    }); // ход был изменён, сохранить только его

  console.log({ changedTurns });

  updateCoordinatesRequest(changedTurns).then((data) => {
    dispatch({ type: turnsTypes.TURNS_SYNC_DONE });
    dispatch(addNotification({ title: 'Info:', text: 'Field has been saved' }));
  });

  saveGamePositionRequest(gamePosition);
};

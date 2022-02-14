import { getGameRequest, getTurnsRequest } from '@/modules/game/requests';
import * as turnsTypes from '@/modules/turns/redux/types';
import * as linesTypes from '@/modules/lines/redux/types';
import * as types from './types';

export const loadFullGame = (hash) => (dispatch) => {
  // GET GAME DATA
  getGameRequest(hash)
    .then((data) => {
      dispatch({
        type: types.LOAD_GAME,
        payload: data.item,
      });

      dispatch({
        type: linesTypes.LOAD_LINES,
        payload: data.item.lines
      });

      const viewport = {
        x: data.item.viewportPointX,
        y: data.item.viewportPointY,
      }

      // GET TURNS DATA
      getTurnsRequest(hash).then((data) => {
        dispatch({
          type: turnsTypes.LOAD_TURNS,
          payload: { turns: data.items.map(turn => ({
            ...turn,
            x: turn.x - viewport.x,
            y: turn.y - viewport.y,
          })) },
        });
      });
    })
}
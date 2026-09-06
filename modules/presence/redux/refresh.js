import { getGameRequest } from '@/modules/game/requests';
import * as linesTypes from '@/modules/lines/redux/types';
import {
  loadTurnsData,
  loadTurnsGeometry,
  recalcAreaRect,
} from '@/modules/turns/redux/actions';

// The guide saved the field: a follower fetches the geometry of every turn
// against the current position of the canvas (so the canvas stays where it
// is — no field move is dispatched), then the content of the turns it already
// holds (moved cards, new scroll positions of paragraphs), then the lines of
// the game (created since, they are saved by their own requests), and
// recalculates the area of the minimap. Turns that came into the render area
// get their content through the usual lazy loader of the canvas. Strokes, the
// cursor and the presence slice are not touched.
//
// Kept apart from actions.js on purpose: the socket dispatches this on the
// guide's frame, and actions.js imports the socket — importing actions.js from
// the socket would close a cycle.
export const refreshAfterSave = () => (dispatch, getState) => {
  const state = getState();
  const hash = state.game.game?.hash;
  if (!hash) return Promise.resolve();
  return dispatch(loadTurnsGeometry(hash, state.game.position)).then(() => {
    const { d, g } = getState().turns;
    const ids = Object.keys(d).filter((id) => !!g[id]);
    const data = ids.length ? dispatch(loadTurnsData(ids)) : Promise.resolve();
    const lines = getGameRequest(hash).then((res) => {
      if (!res?.item?.lines) return;
      dispatch({ type: linesTypes.LINES_LOAD, payload: res.item.lines });
    });
    return Promise.all([data, lines]).then(() => dispatch(recalcAreaRect()));
  });
};

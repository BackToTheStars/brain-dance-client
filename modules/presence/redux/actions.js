import { PANEL_PRESENCE } from '@/config/panel';
import {
  CAST_VIEWPORT,
  CLOSE_GOING_AWAY,
  CLOSE_NORMAL,
  MSG_CAST,
  MSG_FOLLOW,
  MSG_LEAD,
} from '@/config/presence';
import { togglePanel } from '@/modules/panels/redux/actions';
import * as socket from '../socket';
import * as types from './types';

// Online is one state: the socket and the presence panel open and close
// together, and the "Close" button of the panel is the same as switching
// online off in the Info panel.
const goOffline = (dispatch, code) => {
  socket.disconnect(code);
  dispatch({ type: types.PRESENCE_RESET });
  dispatch(togglePanel({ type: PANEL_PRESENCE, open: false }));
};

// `reloadUserInfo` comes from the user context of the component that flips the
// switch: the socket needs it only when the server rejects the stored token and
// a refreshed one lands in localStorage — the context does not re-read the
// storage on its own.
export const setOnline =
  (on, { reloadUserInfo = null } = {}) =>
  (dispatch, getState) => {
    if (!on) {
      goOffline(dispatch, CLOSE_NORMAL);
      return;
    }
    const hash = getState().game.game?.hash;
    if (!hash) return;
    dispatch(togglePanel({ type: PANEL_PRESENCE, open: true }));
    socket.connect({ hash, dispatch, reloadUserInfo });
  };

// Leaving the canvas (lobby, another game): the tab "goes away", nothing is
// kept for the next canvas.
export const leaveGame = () => (dispatch) => {
  goOffline(dispatch, CLOSE_GOING_AWAY);
};

const clearError = (dispatch) =>
  dispatch({ type: types.PRESENCE_ERROR_SET, payload: { error: null } });

export const setLead = (on) => (dispatch) => {
  clearError(dispatch);
  socket.send({ t: MSG_LEAD, on: !!on });
};

// `sid` of a leader to follow, or null to unfollow.
export const follow = (sid) => (dispatch) => {
  clearError(dispatch);
  socket.send({ t: MSG_FOLLOW, sid: sid || null });
};

// The centre of my viewport in canvas coordinates: followers centre theirs on
// the same point. `state.game.position` and `state.game.viewport` are the live
// values (the viewport in state.ui is not maintained).
export const castViewport = () => (dispatch, getState) => {
  const { position, viewport } = getState().game;
  clearError(dispatch);
  socket.send({
    t: MSG_CAST,
    kind: CAST_VIEWPORT,
    x: position.x + Math.floor(viewport.width / 2),
    y: position.y + Math.floor(viewport.height / 2),
  });
};

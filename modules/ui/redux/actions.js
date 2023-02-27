import * as types from './types';
import * as turnTypes from '@/modules/turns/redux/types';

import { NOTIFICATION_SHOWTIME, NOTIFICATION_TRANSITION } from '@/config/ui';

export const addNotification =
  ({ title, text }) =>
  (dispatch) => {
    const id = new Date().getTime();
    dispatch({
      type: types.NOTIFICATION_ADD,
      payload: { id, title, text },
    });
    setTimeout(() => {
      dispatch({
        type: types.NOTIFICATION_UPDATE,
        payload: { id },
      });
    }, NOTIFICATION_SHOWTIME);
    setTimeout(() => {
      dispatch({
        type: types.NOTIFICATION_DELETE,
        payload: { id },
      });
    }, NOTIFICATION_SHOWTIME + NOTIFICATION_TRANSITION);
  };

export const viewportGeometryUpdate =
  ({ viewport }) =>
  (dispatch) => {
    dispatch({
      type: types.VIEWPORT_UPDATE,
      payload: { viewport },
    });
    dispatch({
      type: turnTypes.TURNS_UPDATE_GEOMETRY_TIME,
    });
  };

// export const setCallsQueueIsBlocked = (value) => (dispatch) => {
//   dispatch({ type: types.SET_CALLS_QUEUE_IS_BLOCKED, payload: value });
// };

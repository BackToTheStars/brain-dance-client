import * as types from './types';
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

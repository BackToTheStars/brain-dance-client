import * as types from './types';

const initialUIState = {
  notifications: [],
  viewport: { width: 1600, height: 1200 },
  callsQueueIsBlocked: false,
};

export const UIReducer = (state = initialUIState, { type, payload }) => {
  switch (type) {
    case types.NOTIFICATION_ADD:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: payload.id,
            title: payload.title,
            text: payload.text,
            status: 'active',
          },
        ],
      };
    case types.NOTIFICATION_UPDATE:
      return {
        ...state,
        notifications: state.notifications.map((notification) => {
          if (notification.id === payload.id) {
            return { ...notification, status: 'old' };
          } else return notification;
        }),
      };
    case types.NOTIFICATION_DELETE:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== payload.id
        ),
      };
    case types.VIEWPORT_UPDATE:
      return {
        ...state,
        viewport: payload.viewport,
      };
    case types.SET_CALLS_QUEUE_IS_BLOCKED:
      return {
        ...state,
        callsQueueIsBlocked: payload,
      };
    default:
      return state;
  }
};

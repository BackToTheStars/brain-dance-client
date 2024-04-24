import * as types from './types';

const initialUIState = {
  notifications: [],
  viewport: { width: 1600, height: 1200 },
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
    case types.VIEWPORT_SET:
      return {
        ...state,
        viewport: payload,
      };
    default:
      return state;
  }
};

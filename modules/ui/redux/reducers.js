import { SIZE_LG, SIZE_MD, SIZE_SM, SIZE_XL, SIZE_XS } from '@/config/ui/size';
import * as types from './types';

import { defaultSchema as defaultColorSchema } from '@/config/ui/color';
import { defaultSchema as defaultSizeSchema } from '@/config/ui/size';
import { defaultMode } from '@/config/ui/mode';

const defauiltFontSizes = {
  [SIZE_XS]: 12,
  [SIZE_SM]: 14,
  [SIZE_MD]: 16,
  [SIZE_LG]: 18,
  [SIZE_XL]: 20,
};

const customGroups = ['contentSettings', 'interfaceSettings'];

const initialUIState = {
  notifications: [],
  modal: { open: false, type: null, params: {} },
  viewport: { width: 1600, height: 1200 },
  // @todo: get from config
  themeSettings: {
    colorSchema: undefined,
    sizeSchema: undefined,
    mode: undefined,
  },
  // callsQueueIsBlocked: false,
  ...customGroups.reduce((acc, group) => {
    acc[group] = {
      custom: {
        fontSize: { ...defauiltFontSizes },
      },
    };
    return acc;
  }, {}),
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
          (notification) => notification.id !== payload.id,
        ),
      };
    case types.VIEWPORT_UPDATE:
      return {
        ...state,
        viewport: payload.viewport,
      };
    case types.SET_COLOR_SCHEMA:
      return {
        ...state,
        themeSettings: {
          ...state.themeSettings,
          colorSchema: payload,
        },
      };
    case types.SET_SIZE_SCHEMA:
      return {
        ...state,
        themeSettings: {
          ...state.themeSettings,
          sizeSchema: payload,
        },
      };
    case types.SET_MODE:
      return {
        ...state,
        themeSettings: {
          ...state.themeSettings,
          mode: payload,
        },
      };
    case types.RESET_THEME_SETTINGS:
      return {
        ...state,
        themeSettings: {
          colorSchema: defaultColorSchema,
          sizeSchema: defaultSizeSchema,
          mode: defaultMode,
        },
      };
    case types.UI_SPECIFIC_SETTINGS_SET: {
      return {
        ...state,
        [payload.group]: {
          custom: {
            ...state[payload.group].custom,
            [payload.field]: {
              ...state[payload.group].custom[payload.field],
              [payload.size]: payload.value,
            },
          },
        },
      };
    }
    case types.UI_MODAL_SET: {
      return {
        ...state,
        modal: payload,
      };
    }
    default:
      return state;
  }
};

import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';
import {
  MODE_GAME,
  MODE_WIDGET_PDF,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/config/panel';
import * as types from './types';
import { PANEL_ADD_EDIT_TURN, PANEL_BUTTONS } from '@/config/panel';
import { readEditorPanelWidth } from '../helpers/editorPanel';
import { readUserPanelFields, saveUserPanelFields } from './storage';

export const resetAndExit = () => (dispatch) => {
  dispatch({ type: types.PANELS_WIDGETS_QUOTES_RESET });
  dispatch(setActiveQuoteKey(null));
};

// Поля из userFields пишутся на пользователя сразу, у любой роли и без Save Field.
const saveUserFieldsIfChanged = (getState, type, changed) => {
  const panel = getState().panels.d[type];
  if (!panel?.userFields?.some((field) => changed.includes(field))) return;
  saveUserPanelFields(panel);
};

export const togglePanel = (payload) => (dispatch, getState) => {
  dispatch({
    type: types.PANEL_TOGGLE,
    payload: payload,
  });
  saveUserFieldsIfChanged(getState, payload.type, ['isDisplayed']);
};

export const toggleMinimizePanel = (payload) => (dispatch, getState) => {
  dispatch({
    type: types.PANEL_TOGGLE_MINIMIZE,
    payload: payload,
  });
  saveUserFieldsIfChanged(getState, payload.type, ['isMinimized']);
};

export const changePanelGeometry = (type, geometryData) => (dispatch, getState) => {
  dispatch({
    type: types.PANEL_CHANGE_GEOMETRY,
    payload: { type, geometryData },
  });
  saveUserFieldsIfChanged(getState, type, Object.keys(geometryData));
};

export const setPanelMode = (payload) => (dispatch, getState) => {
  let params = payload.params || {};
  if (!payload.params) {
    if (payload.mode === MODE_GAME) {
      params = {
        editTurnId: null,
        editWidgetId: null,
        editWidgetParams: {},
      };
    } else if (payload.mode === MODE_WIDGET_PICTURE) {
      params = {
        editWidgetParams: {},
      };
    } else if (payload.mode === MODE_WIDGET_PDF) {
      // вход в режим виджета PDF: сбрасываем прошлое выделение, активную
      // страницу виджет проставит сам (он знает, где сейчас пользователь)
      params = {
        editWidgetParams: {},
      };
    } else if (payload.mode === MODE_WIDGET_PICTURE_QUOTE_ADD) {
      const state = getState();
      const { turnData, editWidgetParams, editWidgetId } =
        getWidgetDataFromState(state);
      // debugger
      // if (!!editWidgetParams?.activeQuoteId) {
      //   const activeQuote =
      //     state.lines.dByTurnIdAndMarker[turnData._id][
      //       editWidgetParams.activeQuoteId
      //     ];
      //   params = {
      //     editWidgetParams: {
      //       [`${turnData._id}_${editWidgetId}`]: {
      //         activeQuoteId: editWidgetParams.activeQuoteId,
      //         crop: {
      //           unit: '%',
      //           x: activeQuote.x,
      //           y: activeQuote.y,
      //           width: activeQuote.width,
      //           height: activeQuote.height,
      //         },
      //       },
      //     },
      //   };
      // }
    }
  }

  dispatch({
    type: types.PANEL_CHANGE_MODE,
    payload: {
      params,
      ...payload,
    },
  });
};

export const changeWidgetParams = (payload) => (dispatch) => {
  dispatch({
    type: types.PANEL_CHANGE_WIDGET_PARAMS,
    payload: payload, // widgetKey, params
  });
};

// Ширина редактора нужна сдвигу холста до первого открытия панели. Не через
// changePanelGeometry: прочитанное не должно записываться обратно.
export const applyUserPanelSettings = () => (dispatch, getState) => {
  const apply = (type, geometryData) =>
    dispatch({
      type: types.PANEL_CHANGE_GEOMETRY,
      payload: { type, geometryData },
    });
  apply(PANEL_ADD_EDIT_TURN, { width: readEditorPanelWidth() });
  for (const panel of Object.values(getState().panels.d)) {
    if (!panel.userFields) continue;
    const stored = readUserPanelFields(panel);
    if (Object.keys(stored).length) apply(panel.type, stored);
  }
};

// Сброс раскладки: поля userFields возвращаются к умолчаниям описаний панелей.
// Хранилище чистит вызывающий.
export const resetUserPanels = () => (dispatch) => {
  dispatch({ type: types.PANELS_USER_RESET });
};

export const toggleMaximizeQuill = (isMaximized) => (dispatch) => {
  dispatch(
    changePanelGeometry(PANEL_ADD_EDIT_TURN, {
      priorityStyle: isMaximized ? { bottom: '10px' } : { bottom: null },
    }),
  );
  dispatch(togglePanel({ type: PANEL_BUTTONS, open: !isMaximized }));
};

export const setPanels =
  ({ d }) =>
  (dispatch) => {
    dispatch({
      type: types.PANELS_SET,
      payload: { d },
    });
  };

import * as types from './types';
import * as panelTypes from '@/modules/panels/redux/types';
import { PANEL_LINES } from '@/config/panel';
import { resaveTurn } from '@/modules/turns/redux/actions';
import { getWidgetDataFromState } from '@/modules/turns/components/helpers/store';
import {
  filterLinesByQuoteKey,
  filterLinesByQuoteKeys,
  findLineByQuoteKey,
} from '@/modules/lines/components/helpers/line';
import { lineCreate, linesDelete } from '@/modules/lines/redux/actions';
import { useSelector } from 'react-redux';
import { RULE_TURNS_CRUD } from '@/config/user';
import { TYPE_QUOTE_PDF, TYPE_QUOTE_PICTURE } from '../settings';

export const setActiveQuoteKey = (quoteKey) => (dispatch) => {
  dispatch({
    type: types.QUOTE_SET_ACTIVE,
    payload: quoteKey,
  });

  dispatch({
    type: panelTypes.PANEL_TOGGLE,
    payload: { open: !!quoteKey, type: PANEL_LINES },
  });
};

// Общая часть для прямоугольных цитат (картинка и PDF): координаты берутся из
// выделения (crop) в процентах от бокса виджета/страницы. getExtraFields
// добавляет специфику типа — у PDF это номер страницы.
const saveRectQuoteByCrop =
  (type, getExtraFields = () => ({})) =>
  (dispatch, getState) => {
    const state = getState();
    const { turnData, turnGeometry, editWidgetParams } =
      getWidgetDataFromState(state);
    const { x, y, width, height } = editWidgetParams.crop;
    const { activeQuoteId } = editWidgetParams;

    let id = activeQuoteId || Math.floor(new Date().getTime() / 1000);

    const rectQuote = {
      id,
      type,
      x,
      y,
      height,
      width,
      ...getExtraFields(editWidgetParams),
    };

    return new Promise((resolve, reject) => {
      dispatch(
        resaveTurn(
          {
            _id: turnData._id,
            quotes: activeQuoteId
              ? turnData.quotes.map((quote) =>
                  quote.id === activeQuoteId ? rectQuote : quote,
                )
              : [...turnData.quotes, rectQuote],
            x: turnGeometry.position.x,
            y: turnGeometry.position.y,
          },
          {
            success: resolve,
          },
        ),
      );
    });
  };

export const savePictureQuoteByCrop = () =>
  saveRectQuoteByCrop(TYPE_QUOTE_PICTURE);

export const savePdfQuoteByCrop = () =>
  saveRectQuoteByCrop(TYPE_QUOTE_PDF, (params) => ({
    page: params.activePage,
  }));

export const processQuoteClicked =
  (currentQuoteKey, can) => (dispatch, getState) => {
    const state = getState();
    const cancelCallback = state.game.cancelCallback;
    // прежняя выбранная цитата
    const activeQuoteKey = state.quotes.activeQuoteKey;
    const [turnId, marker] = currentQuoteKey.split('_');
    // линии, соединённые с выбранной цитатой
    const oneSideConnectedLines =
      (state.lines.dByTurnIdAndMarker[turnId] &&
        state.lines.dByTurnIdAndMarker[turnId][marker]) ||
      [];
    cancelCallback();
    setTimeout(() => {
      // если выбранная цитата уже активна, то снимаем выделение
      if (activeQuoteKey === currentQuoteKey) {
        dispatch(setActiveQuoteKey(null));
      } else {
        // если ещё нет активной цитаты, то активируем выбранную
        // если нет прав на редактирование, то переключаемся на выбранную
        if (!activeQuoteKey || !can(RULE_TURNS_CRUD)) {
          dispatch(setActiveQuoteKey(currentQuoteKey));
          return;
        }
        // находим установленные связи между активной и выбираемой цитатой
        const twoSideConnectedLines = filterLinesByQuoteKey(
          oneSideConnectedLines,
          activeQuoteKey,
        );
        // если есть связь между активной и выбираемой цитатой, то просто переключаемся на новую
        if (twoSideConnectedLines.length) {
          dispatch(setActiveQuoteKey(currentQuoteKey));
          return;
        }
        // если нет связи, то создаем связь между активной цитатой и выбираемой
        dispatch(
          lineCreate({
            sourceTurnId: activeQuoteKey.split('_')[0],
            sourceMarker: activeQuoteKey.split('_')[1],
            targetTurnId: currentQuoteKey.split('_')[0],
            targetMarker: currentQuoteKey.split('_')[1],
          }),
        );
        dispatch(setActiveQuoteKey(null));
      }
    }, 100);
  };

export const deleteQuote = () => (dispatch, getState) => {
  const state = getState();
  const { turnData, turnGeometry, editWidgetParams } =
    getWidgetDataFromState(state);
  const turnLines = state.lines.dByTurnIdAndMarker[turnData._id];
  
  let id = editWidgetParams.activeQuoteId;
  const linesToDelete = turnLines && turnLines[id] || []
  // filterLinesByQuoteKey(lines, `${turnData._id}_${id}`);

  if (!!linesToDelete.length) {
    dispatch(linesDelete(linesToDelete.map((l) => l._id)));
  }

  return new Promise((resolve, reject) => {
    dispatch(
      resaveTurn(
        {
          _id: turnData._id,
          quotes: turnData.quotes.filter((quote) => quote.id !== id), // @todo find quote and update
          x: turnGeometry.position.x,
          y: turnGeometry.position.y,
        },
        {
          success: resolve, // @todo: заменить на Promise
          error: reject,
        },
      ),
    );
  });
};

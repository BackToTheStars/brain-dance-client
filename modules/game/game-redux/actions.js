import { getGameRequest, updateGameRequest } from '@/modules/game/requests';
import { ERROR_GAME_NOT_FOUND } from '@/config/request';
import * as turnsTypes from '@/modules/turns/redux/types';
import * as linesTypes from '@/modules/lines/redux/types';
import * as types from './types';
import {
  getTurnsGeometryRequest,
  updateCoordinatesRequest,
  updateScrollPositionsRequest,
} from '@/modules/turns/requests';
import { addNotification } from '@/modules/ui/redux/actions';
import {
  loadTurnsGeometry,
  moveField,
  recalcAreaRect,
} from '@/modules/turns/redux/actions';
import {
  getLinesNotExpired,
  getTurnsFromBuffer,
} from '@/modules/turns/components/helpers/dataCopier';
import {
  applyUserPanelSettings,
  resetAndExit,
  resetUserPanels,
  setPanels,
} from '@/modules/panels/redux/actions';
import { GRID_CELL_X, GRID_CELL_Y, ZOOM_STEPS } from '@/config/ui';
import {
  selectUnsavedScrollPositions,
  selectUnsavedTurnIds,
} from '@/modules/turns/redux/selectors';
import { snapRound } from '@/modules/turns/components/helpers/grid';
import { getGameSettings, updateGameSettings } from './storage';
import {
  getPersonalizedPanelSettings,
  savePanelsSettings,
} from '@/modules/panels/redux/storage';
import {
  getStore,
  lsRemoveLayoutSettings,
  lsUpdateLayoutSettings,
} from '@/modules/settings/redux/requests';
import {
  AUTO_SAVE_FIELD_DELAY_DEFAULT,
  AUTO_SAVE_FIELD_DELAY_MAX,
  AUTO_SAVE_FIELD_DELAY_MIN,
} from '@/config/game';

export const setGameStage = (stage) => (dispatch, getState) => {
  const state = getState();
  if (state.game.stage === stage) return;
  dispatch({ type: types.GAME_STAGE_SET, payload: stage });
};

// «Игра не найдена» отдаётся отказом, а не alert: диалог входа показывает его сам.
export const loadShortGame = (hash) => (dispatch) => {
  return new Promise((resolve, reject) => {
    getGameRequest(hash, {
      errorCallback: (message, { errorCode } = {}) => {
        if (errorCode === ERROR_GAME_NOT_FOUND) {
          reject({ errorCode });
          return;
        }
        alert(message);
      },
    }).then((data) => {
      dispatch({
        type: types.GAME_LOAD,
        payload: data.item,
      });
      resolve(data.item);
    });
  });
};

// Стартовая позиция вьюпорта: центр хода из ссылки (?turn=) поверх сохранённых
// настроек игры; при неизвестном ходе — тихий откат на сохранённую позицию.
const resolveStartPosition = (hash, focusTurnId, getState) => {
  const { position: savedPosition } = getGameSettings(hash);
  if (!focusTurnId) {
    return Promise.resolve(savedPosition);
  }
  return getTurnsGeometryRequest(hash)
    .then((data) => {
      const turn = data.items.find((item) => item._id === focusTurnId);
      if (!turn) return savedPosition;
      const viewport = getState().game.viewport;
      const viewportWidth = viewport.width || window.innerWidth;
      const viewportHeight = viewport.height || window.innerHeight;
      return {
        x:
          turn.position.x +
          Math.floor(turn.size.width / 2) -
          Math.floor(viewportWidth / 2),
        y:
          turn.position.y +
          Math.floor(turn.size.height / 2) -
          Math.floor(viewportHeight / 2),
      };
    })
    .catch(() => savedPosition);
};

export const loadFullGame =
  (hash, { focusTurnId = null } = {}) =>
  (dispatch, getState) => {
    // До первого расчёта окна (Game.js) и геометрии ходов: окно зависит от масштаба.
    dispatch(loadZoom());
    // GET GAME DATA
    return new Promise((resolve, reject) => {
      const d = getState().panels.d;
      const personalizedPanels = getPersonalizedPanelSettings(hash, d);
      dispatch(setPanels({ d: personalizedPanels }));
      // поверх настроек игры — то, что помнится на пользователя (ширина панели
      // редактора хода, мини-карта, место панели онлайн)
      dispatch(applyUserPanelSettings());
      getGameRequest(hash).then((data) => {
        resolveStartPosition(hash, focusTurnId, getState).then(({ x, y }) => {
          const position = {
            x: snapRound(x, GRID_CELL_X),
            y: snapRound(y, GRID_CELL_X),
          };
          dispatch({
            type: types.GAME_LOAD,
            payload: { ...data.item, position },
          });

          dispatch({
            type: linesTypes.LINES_LOAD,
            payload: data.item.lines,
          });

          dispatch(loadTurnsGeometry(hash, position)).then(() => {
            resolve();
          });
        });
      });
    });
  };

// Сохранённая позиция поля обязана побеждать при перезагрузке, а `?turn=` из
// ссылки её перебивает: resolveStartPosition центрирует ход поверх сохранённого.
// Поэтому после сохранения параметр уходит из адреса — без перезагрузки и не
// трогая остальные параметры. Next патчит history.replaceState, так что
// useSearchParams узнает об этом сам; перерисовка холста от этого не зависит —
// focusTurnId читается один раз, на монтировании.
const dropTurnFromUrl = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('turn')) return;
  url.searchParams.delete('turn');
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
};

// request() при ошибке сервера промис не завершает, а зовёт errorCallback.
const withRejection = (call) =>
  new Promise((resolve, reject) => {
    call({ errorCallback: (message) => reject(new Error(message)) }).then(
      resolve,
      reject,
    );
  });

// `onSaved` — после обоих запросов; его передаёт вызывающий: импорт presence замкнул бы цикл в прод-сборке.
// `silent` — автосохранение: ходы и прокрутка без позиции холста, панелей и уведомления; ошибка — отказом.
export const saveField = ({ onSaved = null, silent = false } = {}) => (dispatch, getState) => {
  const state = getState();
  const hash = state.game.game.hash;
  const gamePosition = state.game.position;
  const scrollPositions = selectUnsavedScrollPositions(state);

  const changedTurns = selectUnsavedTurnIds(state).map((id) => {
    const turn = state.turns.g[id];
    return {
      _id: id,
      x: snapRound(turn.position.x, GRID_CELL_X),
      y: snapRound(turn.position.y, GRID_CELL_X),
      width: snapRound(turn.size.width, GRID_CELL_X),
      height: snapRound(turn.size.height, GRID_CELL_Y),
      // у хода без разделителя ключа нет: сервер отличает отсутствие от нуля
      splitHeight: state.turns.d[id]?.splitHeight,
    };
  });

  // На сетку — до запроса: ответ, пришедший после нового перетаскивания, не
  // должен возвращать карточку назад.
  dispatch({
    type: turnsTypes.TURNS_UPDATE_GEOMETRY,
    payload: {
      turns: changedTurns.map(({ _id, x, y, width, height }) => ({
        _id,
        position: { x, y },
        size: { width, height },
      })),
    },
  });

  const send = (call) => (silent ? withRejection(call) : call());
  const coordinatesSaved = send((options) =>
    updateCoordinatesRequest(changedTurns, options),
  ).then(() => {
    if (changedTurns.length) {
      dispatch({
        type: turnsTypes.TURNS_GEOMETRY_SAVED,
        payload: { turns: changedTurns },
      });
    }
    if (silent) return;
    dispatch(addNotification({ title: 'Info:', text: 'Field has been saved' }));
    dispatch(resetAndExit());
  });
  if (!silent) {
    updateGameSettings(hash, 'position', gamePosition);
    dropTurnFromUrl();
    savePanelsSettings(hash, state.panels.d);
  }
  const scrollSaved = scrollPositions.length
    ? send((options) =>
        updateScrollPositionsRequest(scrollPositions, options),
      ).then(() => {
        dispatch({
          type: turnsTypes.TURNS_SCROLL_SAVED,
          payload: scrollPositions,
        });
      })
    : Promise.resolve();
  const saved = Promise.all([coordinatesSaved, scrollSaved]);
  // Отказ тихой записи получает вызывающий из возвращённого промиса; ветка
  // колбэка без обработчика дала бы необработанный отказ.
  if (typeof onSaved === 'function') saved.then(() => onSaved(), () => {});
  return saved;
};

const clampAutoSaveDelay = (value) =>
  Number.isFinite(value)
    ? Math.min(
        Math.max(Math.round(value), AUTO_SAVE_FIELD_DELAY_MIN),
        AUTO_SAVE_FIELD_DELAY_MAX,
      )
    : AUTO_SAVE_FIELD_DELAY_DEFAULT;

// Auto Save Field помнится на пользователя, а не на игру — в
// userSettings.layoutSettings, рядом с настройками панелей. Только на клиенте.
export const loadAutoSaveField = () => (dispatch) => {
  const { autoSaveField, autoSaveFieldDelay } = getStore().layoutSettings || {};
  dispatch({
    type: types.GAME_AUTO_SAVE_SET,
    payload: {
      enabled: autoSaveField === true,
      delay: clampAutoSaveDelay(autoSaveFieldDelay),
    },
  });
};

export const setAutoSaveField = (patch) => (dispatch, getState) => {
  const current = getState().game.autoSave;
  const next = {
    enabled: patch.enabled ?? current.enabled,
    delay: clampAutoSaveDelay(patch.delay ?? current.delay),
  };
  lsUpdateLayoutSettings({
    autoSaveField: next.enabled,
    autoSaveFieldDelay: next.delay,
  });
  dispatch({ type: types.GAME_AUTO_SAVE_SET, payload: next });
};

// Стор обязан повторять буфер, в том числе когда буфер опустел: по
// `turns.turnsToPaste` рисуется кнопка «Paste Turn» в игровом режиме
// (GameMode.js) и таблица PasteTurnPanel. Раньше пустой результат не
// доезжал до стора (`if (turnsToPaste.length)`), поэтому после вставки
// последнего хода кнопка оставалась висеть.
export const loadTurnsAndLinesToPaste = () => (dispatch) => {
  dispatch({
    type: turnsTypes.TURNS_LOAD_TO_PASTE,
    payload: { turnsToPaste: getTurnsFromBuffer() },
  });
  dispatch({
    type: linesTypes.LINES_LOAD_TO_PASTE,
    payload: { linesToPaste: getLinesNotExpired() },
  });
};

export const reloadTurnsToPaste = () => (dispatch) => {
  const turnsToPaste = getTurnsFromBuffer();
  dispatch({
    type: turnsTypes.TURNS_LOAD_TO_PASTE,
    payload: { turnsToPaste },
  });
}

export const centerViewportAtPosition =
  ({ x, y }) =>
  (dispatch, getState) => {
    const state = getState();
    const position = state.game.position;
    const viewport = state.game.viewport;

    const left = position.x - x + Math.floor(viewport.width / 2);
    const top = position.y - y + Math.floor(viewport.height / 2);

    if (typeof $ === 'undefined') return;

    const gameBoxEl = $('#game-box');

    gameBoxEl.addClass('remove-line-transition');
    gameBoxEl.animate(
      {
        left: `${left}px`,
        top: `${top}px`,
      },
      300,
      () => {
        dispatch(
          moveField({
            left: -left,
            top: -top,
          }),
        );
        gameBoxEl.css('left', 0);
        gameBoxEl.css('top', 0);
        setTimeout(() => {
          gameBoxEl.removeClass('remove-line-transition');
        }, 100);
      },
    );
  };

export const createCancelCallback = (callback) => (dispatch) => {
  dispatch({ type: types.GAME_CREATE_CANCEL_CALLBACK, payload: callback });
};

// `screen` — размер окна браузера; в стор окно ложится в единицах холста.
export const updateViewportGeometry = (screen) => (dispatch, getState) => {
  const state = getState();
  if (!screen) return;
  const { zoom } = state.game;
  const viewport = {
    width: screen.width / zoom,
    height: screen.height / zoom,
  };
  if (
    viewport.width === state.game.viewport.width &&
    viewport.height === state.game.viewport.height
  ) {
    return;
  }
  dispatch({
    type: types.GAME_VIEWPORT_SET,
    payload: viewport,
  });
  // Which cards are drawn is decided only when the field loads or moves, and
  // the area of the minimap is recalculated by the same events: without this a
  // window grown wider showed an empty strip until the next drag, and the
  // minimap kept the old area. The position does not change — only the size.
  dispatch({
    type: turnsTypes.TURNS_FIELD_WAS_MOVED,
    payload: { position: state.game.position, size: viewport },
  });
  dispatch(recalcAreaRect());
};

// Масштаб помнится на пользователя, а не на игру. Позиция не сдвигается:
// сохранённая позиция — левый верхний угол окна при любом масштабе.
export const loadZoom = () => (dispatch, getState) => {
  const { zoom: stored } = getStore().layoutSettings || {};
  const zoom = ZOOM_STEPS.includes(stored) ? stored : 1;
  const { zoom: current, position } = getState().game;
  if (zoom === current) return;
  dispatch({ type: types.GAME_ZOOM_SET, payload: { zoom, position } });
};

// Центр окна остаётся на месте с точностью до сетки: позиция прижимается к ней
// так же, как при загрузке игры, иначе после Save Field и F5 холст сдвигается.
export const setZoom = (zoom) => (dispatch, getState) => {
  const { zoom: current, position } = getState().game;
  if (zoom === current || !ZOOM_STEPS.includes(zoom)) return;
  const screen = { width: window.innerWidth, height: window.innerHeight };
  const shift = (size) => (size / 2) * (1 / current - 1 / zoom);
  dispatch({
    type: types.GAME_ZOOM_SET,
    payload: {
      zoom,
      position: {
        x: snapRound(position.x + shift(screen.width), GRID_CELL_X),
        y: snapRound(position.y + shift(screen.height), GRID_CELL_X),
      },
    },
  });
  lsUpdateLayoutSettings({ zoom });
  dispatch(updateViewportGeometry(screen));
};

// Ключи layoutSettings, которые сбрасывает Info; ключи лобби (leftSideWidth,
// sliderWidth) не входят.
const LAYOUT_RESET_KEYS = [
  'zoom',
  'autoSaveField',
  'autoSaveFieldDelay',
  'editorPanelWidth',
  'mediaQuotesPanelWidth',
  'editorFontSize',
  'presencePanelCollapsed',
  'panels',
];

// Сброс раскладки из Info: сразу и без перезагрузки. Позиция холста, коды, онлайн
// и экскурсия остаются.
export const resetLayoutSettings = () => (dispatch, getState) => {
  dispatch(setZoom(1));
  lsRemoveLayoutSettings(LAYOUT_RESET_KEYS);
  const hash = getState().game.game?.hash;
  if (hash) updateGameSettings(hash, 'panels', {});
  dispatch(loadAutoSaveField());
  dispatch(resetUserPanels());
  dispatch(applyUserPanelSettings());
};

// Правка игры из панели Info. `PUT /game` отвечает частью игры — name,
// description, public, image, hash, — без position, codes, lines и auth,
// поэтому кладём её слиянием (GAME_UPDATE), а не заменой (GAME_LOAD).
// `_id` из ответа не берём: `GET /game` его намеренно не отдаёт, и в сторе
// его никогда не было.
export const updateGame = (data) => (dispatch) => {
  return new Promise((resolve) => {
    updateGameRequest(data).then((data) => {
      const { _id, ...game } = data.item;
      dispatch({
        type: types.GAME_UPDATE,
        payload: game,
      });

      resolve(data.item);
    });
  });
};

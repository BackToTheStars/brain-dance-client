import * as types from './types';
import * as gameTypes from '@/modules/game/game-redux/types';
import * as quotesTypes from '@/modules/quotes/redux/types';
import {
  createTurnRequest,
  deleteTurnRequest,
  getTokenRequest,
  getTurnsByIdsRequest,
  getTurnsGeometryRequest,
  updateTurnRequest,
} from '../requests';
import {
  dataCopy,
  fieldRemover,
  getTurnFromBufferAndRemove,
  getTurnsFromBuffer,
  saveTurnInBuffer,
} from '../components/helpers/dataCopier';
import turnSettings from '../settings';
import { addNotification } from '@/modules/ui/redux/actions';
import {
  centerViewportAtPosition,
  loadTurnsAndLinesToPaste,
} from '@/modules/game/game-redux/actions';
import { linesCreate, linesDelete } from '@/modules/lines/redux/actions';
import { filterLinesByTurnId } from '@/modules/lines/components/helpers/line';
import { resetAndExit, togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_TURNS_PASTE } from '@/config/panel';
import { STATIC_MEDIA_URL } from '@/config/server';

import { GRID_CELL_X, GRID_CELL_Y } from '@/config/ui';
import { snapRound } from '../components/helpers/grid';
import { TurnHelper } from './helpers';
import { getBoundingAreaRect } from '@/modules/minimap/components/helpers/screen';
import {
  isBorderCoincides,
  isRectInsideArea,
} from '../components/helpers/sizeHelper';

export const moveFieldToTopLeft = (turn) => (dispatch, getState) => {
  const state = getState();
  const isSnapToGrid = true;
  const gameFieldMoveVector = isSnapToGrid
    ? {
        left: snapRound(turn.position.x, GRID_CELL_X),
        top: snapRound(turn.position.y, GRID_CELL_Y),
      }
    : { left: turn.position.x, top: turn.position.y };
  dispatch(moveField(gameFieldMoveVector));
};

export const loadTurnsGeometry = (hash, position) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const viewport = {
      position,
      size: {
        width: state.game.viewport.width,
        height: state.game.viewport.height,
      },
    };
    return getTurnsGeometryRequest(hash).then((data) => {
      dispatch({
        type: types.TURNS_LOAD_GEOMETRY,
        payload: {
          viewport,
          turns: data.items,
        },
      });
      dispatch({
        type: gameTypes.GAME_SCREEN_RECT_SET,
        payload: getBoundingAreaRect([...data.items], viewport),
      });
      resolve();
    });
  });
};

export const loadTurnsData = (turnIds) => (dispatch) => {
  return getTurnsByIdsRequest(turnIds).then((data) => {
    dispatch({
      type: types.TURNS_LOAD_DATA,
      payload: {
        turns: data.items.map((turn) => TurnHelper.toNewFields(turn)),
      },
    });
  });
};

// TURN_UPDATE_GEOMETRY помечает ход как изменённый (wasChanged), а `recalculateSize`
// в components/Turn.js зовёт updateGeometry при монтировании каждой карточки — даже
// когда пересчитанные размеры совпали с тем, что уже в сторе. Без этой проверки
// достаточно открыть игру и проскроллить холст, чтобы Save Field отправил на сервер
// геометрию всех отрисованных ходов.
const isGeometryChanged = (current, { position, size }) => {
  if (
    position &&
    (position.x !== current.position?.x || position.y !== current.position?.y)
  ) {
    return true;
  }
  if (
    size &&
    (size.width !== current.size?.width || size.height !== current.size?.height)
  ) {
    return true;
  }
  return false;
};

export const updateGeometry = (data) => (dispatch, getState) => {
  const current = getState().turns.g[data._id];
  if (current && !isGeometryChanged(current, data)) return;
  return dispatch({
    type: types.TURN_UPDATE_GEOMETRY,
    payload: data,
  });
};

export const updateWidget = (turnId, widgetId, widget) => (dispatch) => {
  dispatch({
    type: types.TURN_UPDATE_WIDGET,
    payload: { turnId, widgetId, widget },
  });
  dispatch(markTurnAsChanged({ _id: turnId }));
};

export const markTurnAsChanged =
  ({ _id }) =>
  (dispatch, getState) => {
    const state = getState();
    const turn = state.turns.d[_id];
    if (turn.wasChanged) return;
    return dispatch({
      type: types.TURN_WAS_CHANGED,
      payload: { _id },
    });
  };

export const compressParagraph = () => (dispatch, getState) => {
  const state = getState();
  const editTurnId = state.panels.editTurnId;
  const activeTurnData = state.turns.d[editTurnId];
  const activeTurnGeometry = state.turns.g[editTurnId];
  const currentWidget = activeTurnData.dWidgets['p_1'];

  updateTurnRequest(editTurnId, {
    compressed: true,
    uncompressedHeight: activeTurnGeometry.size.height,
  }).then(() => {
    dispatch({
      type: types.TURN_UPDATE_WIDGET,
      payload: {
        turnId: editTurnId,
        widgetId: 'p_1',
        widget: {
          ...currentWidget,
          compressed: true,
        },
      },
    });
  });
};

export const unCompressParagraph = () => (dispatch, getState) => {
  const state = getState();
  const editTurnId = state.panels.editTurnId;
  const activeTurnData = state.turns.d[editTurnId];
  const currentWidget = activeTurnData.dWidgets['p_1'];
  updateTurnRequest(editTurnId, {
    compressed: false,
    height: activeTurnData.uncompressedHeight,
  }).then((data) => {
    dispatch({
      type: types.TURN_UPDATE_WIDGET,
      payload: {
        turnId: editTurnId,
        widgetId: 'p_1',
        widget: {
          ...currentWidget,
          compressed: false,
        },
      },
    });
    // setTimeout(() => {
    dispatch({
      type: types.TURN_UPDATE_GEOMETRY,
      payload: {
        _id: data.item._id,
        size: {
          width: data.item.width,
          height: data.item.height,
        },
      },
    });
    // @todo: use paragraph stage
    const turnEl = document.querySelector(
      `.turn_${data.item._id} .stb-react-turn__inner`,
    );
    if (turnEl) {
      turnEl.style.height = `${data.item.height}px`;
    }
    // }, 300);
  });
};

export const updateScrollPosition = (data) => (dispatch) =>
  dispatch({
    type: types.TURNS_SCROLL,
    payload: data,
  });

export const clearScrollPositions = () => (dispatch) =>
  dispatch({
    type: types.TURNS_SCROLL_CLEAR,
  });

export const moveField = (data) => (dispatch, getState) => {
  const state = getState();
  const isSnapToGrid = true;
  const gameFieldMoveVector = isSnapToGrid
    ? {
        left: snapRound(data.left, GRID_CELL_X),
        top: snapRound(data.top, GRID_CELL_X),
      }
    : data;
  const viewportPrev = {
    position: {
      x: state.game.position.x,
      y: state.game.position.y,
    },
    size: {
      width: state.game.viewport.width,
      height: state.game.viewport.height,
    },
  };
  const viewport = {
    ...viewportPrev,
    position: {
      x: viewportPrev.position.x + gameFieldMoveVector.left,
      y: viewportPrev.position.y + gameFieldMoveVector.top,
    },
  };
  dispatch({
    type: gameTypes.GAME_FIELD_MOVE,
    payload: gameFieldMoveVector,
  });
  dispatch({
    type: types.TURNS_FIELD_WAS_MOVED,
    payload: viewport,
  });

  // проверка, нужно ли менять размеры поля ходов
  const screenArea = {
    position: {
      x: state.game.areaRect.left,
      y: state.game.areaRect.top,
    },
    size: {
      width: state.game.areaRect.width,
      height: state.game.areaRect.height,
    },
  };

  if (
    isBorderCoincides(viewportPrev, screenArea) ||
    isRectInsideArea(viewport, screenArea) !==
      isRectInsideArea(viewportPrev, screenArea)
  ) {
    dispatch({
      type: gameTypes.GAME_SCREEN_RECT_SET,
      payload: getBoundingAreaRect([...Object.values(state.turns.g), viewport]),
    });
  }
};

export const recalcAreaRect = () => (dispatch, getState) => {
  const state = getState();
  const viewport = state.game.viewport;
  const position = state.game.position;
  dispatch({
    type: gameTypes.GAME_SCREEN_RECT_SET,
    payload: getBoundingAreaRect([
      ...Object.values(state.turns.g),
      {
        position,
        size: viewport,
      },
    ]),
  });
};

export const createTurn = (turn, callbacks) => (dispatch) => {
  createTurnRequest(turn).then((data) => {
    dispatch({
      type: types.TURN_CREATE,
      payload: TurnHelper.toNewFields(data.item),
    });
    callbacks?.success(TurnHelper.toNewFields(data.item));
  });
};

export const deleteTurn = (_id) => (dispatch, getState) => {
  const state = getState();
  const allLines = Object.values(state.lines.d);
  const lines = filterLinesByTurnId(allLines, _id);
  dispatch(linesDelete(lines.map((line) => line._id))).then(() => {
    deleteTurnRequest(_id).then((data) => {
      dispatch({
        type: types.TURN_DELETE,
        payload: _id,
      });
    });
  });
};

export const resaveTurn = (turn, callbacks) => (dispatch) => {
  updateTurnRequest(turn._id, turn).then((data) => {
    const preparedTurn = {
      ...data.item,
      x: turn.x,
      y: turn.y,
    };
    dispatch({
      type: types.TURN_RESAVE,
      payload: TurnHelper.toNewFields(preparedTurn),
    });
    callbacks?.success();
  });
};

export const cloneTurn = (_id) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    try {
      const state = getState();
      const turnData = state.turns.d[_id];
      const turnGeometry = state.turns.g[_id];
      // @fixme
      const newFormatTurn = {
        ...turnData,
        position: turnGeometry.position,
        size: turnGeometry.size,
      };
      const turn = TurnHelper.toOldFields(newFormatTurn);
      const lines = Object.values(state.lines.d);
      const copiedTurn = dataCopy(turn);
      // @todo: проверить, откуда появляется _id в quotes
      copiedTurn.quotes = copiedTurn.quotes.map((quote) => ({
        id: quote.id,
        type: quote.type,
        text: quote.text, // @todo добавить это поле потом, сохранение по кнопке Save Turn
        x: quote.x,
        y: quote.y,
        height: quote.height,
        width: quote.width,
      }));

      copiedTurn.originalId = copiedTurn._id; // copiedTurn.originalId ||
      const copiedTurnId = copiedTurn._id;

      const { fieldsToClone } = turnSettings;

      fieldRemover(copiedTurn, fieldsToClone); // передали {ход} и [сохраняемые поля]

      const linesFieldsToKeep = [
        'sourceMarker',
        'sourceTurnId',
        'targetMarker',
        'targetTurnId',
        'type',
      ];

      const copiedLines = dataCopy(
        lines.filter(
          (line) =>
            line.sourceTurnId === copiedTurnId ||
            line.targetTurnId === copiedTurnId,
        ),
      );
      copiedLines.forEach((line) => fieldRemover(line, linesFieldsToKeep));

      saveTurnInBuffer({ copiedTurn, copiedLines }); // сохранили turn в LocalStorage

      dispatch(loadTurnsAndLinesToPaste());

      dispatch(
        addNotification({
          title: 'Info:',
          text: 'Turn was copied, ready to paste',
        }),
      );

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

// Выход из режима вставки. Тем же путём, что у Cancel в
// `panels/components/buttons/operations/TurnPasteMode.js`: `resetAndExit`
// возвращает mode в MODE_GAME и снимает активную цитату, плюс закрывается сама
// панель. Раньше выход был написан только для Cancel, а вставка и удаление из
// буфера решали это сами условием `getTimeStamps().length === 1` — по модульному
// кэшу, который наполняется только копированием и после перезагрузки страницы
// пуст. Отсюда «вырезал → F5 → вставил»: режим не выходил вовсе. Условие теперь
// по фактическому остатку буфера.
export const exitPasteModeIfBufferEmpty = () => (dispatch) => {
  if (getTurnsFromBuffer().length) return;
  dispatch(resetAndExit());
  dispatch(togglePanel({ type: PANEL_TURNS_PASTE, open: false }));
};

export const insertTurnFromBuffer =
  (timeStamp, { errorCallback }) =>
  (dispatch, getState) => {
    const state = getState();
    // запасной путь на случай вызова без метки — берём последнюю запись буфера.
    // Раньше здесь тоже был getTimeStamps() (модульный кэш), и после перезагрузки
    // страницы он пуст, то есть без метки вставлять было нечего.
    const turnsInBuffer = getTurnsFromBuffer();
    const copiedTurnOldFormat = getTurnFromBufferAndRemove(
      timeStamp ? timeStamp : turnsInBuffer.at(-1)?.timeStamp,
    );
    const copiedTurn = TurnHelper.toNewFields(copiedTurnOldFormat);
    const { pasteNextTurnPosition } = state.turns;
    const position = state.game.position;
    const viewport = state.game.viewport;
    copiedTurn.position = {};
    if (!!pasteNextTurnPosition) {
      copiedTurn.position.x = pasteNextTurnPosition.x;
      copiedTurn.position.y = pasteNextTurnPosition.y;
    } else {
      copiedTurn.position.x =
        position.x + Math.floor((viewport.width - copiedTurn.size.width) / 2);
      copiedTurn.position.y =
        position.y + Math.floor((viewport.height - copiedTurn.size.height) / 2);
    }

    if (!copiedTurn) {
      errorCallback('No turn in buffer');
      return false;
    }

    dispatch(loadTurnsAndLinesToPaste());
    dispatch(exitPasteModeIfBufferEmpty());
    // // @todo: get lines, connected with copied turn and display them
    dispatch(
      createTurn(TurnHelper.toOldFields(copiedTurn), {
        success: (turn) => {
          dispatch({
            type: types.TURN_NEXT_PASTE_POSITION,
            payload: {
              x: copiedTurn.position.x + copiedTurn.size.width + 40, // вставляет Paste Turn с промежутком от предыдущей вставки
              y: copiedTurn.position.y,
            },
          });
          dispatch(
            centerViewportAtPosition({
              x: copiedTurn.position.x + Math.floor(copiedTurn.size.width / 2),
              y: copiedTurn.position.y + Math.floor(copiedTurn.size.height / 2),
            }),
          );
          const turnId = copiedTurn.originalId;
          // оставить только те линии, которые связаны с turn по originalId
          const savedLinesToPaste = state.lines.linesToPaste;
          const sourceLines = []; // заменить sourceTurnId
          const targetLines = []; // заменить targetTurnId

          const turnsDict = state.turns.d;
          Object.keys(savedLinesToPaste)
            .filter((lineKey) => lineKey.indexOf(`${turnId}`) !== -1)
            .forEach((lineKey) => {
              // составить набор id из противоположных концов линий
              const line = savedLinesToPaste[lineKey];
              if (line.sourceTurnId === turnId) {
                sourceLines.push(line);
              } else {
                targetLines.push(line);
              }
            });
          // найти все шаги игры, которые имеют id или originalId из набора

          // ещё раз отфильтровать линии, оставить только те, что с двумя концами
          const lines = [];
          for (let sourceLine of sourceLines) {
            if (turnsDict[sourceLine.targetTurnId]) {
              // @learn массив есть и он не пустой

              lines.push({
                ...sourceLine,
                sourceTurnId: turn._id,
                targetTurnId: sourceLine.targetTurnId,
              });
            }
          }
          for (let targetLine of targetLines) {
            if (turnsDict[targetLine.sourceTurnId]) {
              // @learn массив есть и он не пустой

              lines.push({
                ...targetLine,
                targetTurnId: turn._id,
                sourceTurnId: targetLine.sourceTurnId,
              });
            }
          }
          if (!!lines.length) {
            dispatch(linesCreate(lines));
          }

          // преобразовать sourceTurnId и targetTurnId и вставить линии
        },
        errorCallback,
      }),
    );
  };

export const removeTurnFromBuffer = (timeStamp) => (dispatch) => {
  getTurnFromBufferAndRemove(timeStamp);
  dispatch(loadTurnsAndLinesToPaste());
  dispatch(exitPasteModeIfBufferEmpty());
};

export const resetTurnNextPastePosition = () => (dispatch, getState) => {
  const state = getState();
  if (state.turns.pasteNextTurnPosition) {
    dispatch({ type: types.TURN_NEXT_PASTE_POSITION, payload: null });
  }
};

// Загрузка файла на media: сначала одноразовый токен у сервера, потом multipart на статику.
// Второй запрос идёт через XMLHttpRequest, а не fetch: fetch не сообщает прогресс отправки
// тела, а `xhr.upload.onprogress` — сообщает. onProgress(percent) вызывается только для
// второго запроса (получение токена мгновенное и в прогресс не входит); percent === 100
// означает, что тело ушло целиком, но ответа media ещё нет — media пишет файл в GridFS
// уже после полного приёма, поэтому вызывающий показывает вторую фазу «обработка».
// Ошибку обязательно доводим до вызывающего (FileUploading показывает её и снимает индикатор):
// media отдаёт `{ message }` на 400/413, а request() при ошибке сервера промис не завершает —
// поэтому здесь и errorCallback, и проверка ответа статики.
export const uploadMedia = (type, file, onProgress) => () => {
  return new Promise((resolve, reject) => {
    getTokenRequest('upload', {
      errorCallback: (message) => reject(new Error(message)),
    })
      .then((data) => {
        const token = data.item;
        const formdata = new FormData();
        formdata.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${STATIC_MEDIA_URL}/${type}/upload`);
        xhr.setRequestHeader('authorization', `Bearer ${token}`);

        if (typeof onProgress === 'function') {
          onProgress(0);
          xhr.upload.onprogress = (e) => {
            // lengthComputable === false бывает при неизвестном размере тела —
            // тогда просто не двигаем полосу, вызывающий останется на 0
            if (!e.lengthComputable || !e.total) return;
            onProgress(Math.round((e.loaded / e.total) * 100));
          };
          // тело ушло целиком — дальше ждём ответ media (запись в GridFS)
          xhr.upload.onload = () => onProgress(100);
        }

        xhr.onload = () => {
          let result = {};
          try {
            result = JSON.parse(xhr.responseText) || {};
          } catch {
            result = {};
          }
          const ok = xhr.status >= 200 && xhr.status < 300;
          if (!ok || !result.src) {
            reject(
              new Error(result.message || `Ошибка загрузки (${xhr.status})`),
            );
            return;
          }
          resolve(result);
        };
        xhr.onerror = () => reject(new Error('Ошибка сети при загрузке файла'));
        xhr.onabort = () => reject(new Error('Загрузка отменена'));

        xhr.send(formdata);
      })
      .catch(reject);
  });
};

// PUT videoQuotes/audioQuotes может ответить без quotes (сервер до починки
// схемы их отбрасывал, старые ходы в базе тоже могут быть без массива) —
// TimelineQuotes.js итерирует quotes без собственной защиты, поэтому
// подстановка [] нужна здесь, в одном месте разбора ответа, для всех
// четырёх действий ниже.
const withQuotesFallback = (widget) => ({
  ...widget,
  quotes: widget?.quotes ?? [],
});

export const addVideoQuotesWidget =
  (turnId, editWidgetId, duration) => (dispatch, getState) => {
    const videoQuotes = {
      connectedTo: editWidgetId, // v_1
      duration,
      quotes: [
        {
          id: Math.floor(Date.now() / 1000),
          text: '',
          start: 0,
          active: false,
        },
      ],
    };
    return updateTurnRequest(turnId, { videoQuotes }).then((data) => {
      dispatch({
        type: types.TURN_UPDATE_WIDGET,
        payload: {
          turnId: turnId,
          widgetId: 'vq_1',
          widget: withQuotesFallback(data.item.videoQuotes),
        },
      });
    });
  };

export const deleteVideoQuotesWidget =
  (turnId, widgetId) => (dispatch, getState) => {
    const state = getState();
    const quotes = state.turns.d[turnId].dWidgets['vq_1'].quotes;
    const dLines = state.lines.dByTurnIdAndMarker[turnId];
    const dLineIdsToRemove = {};
    for (const quote of quotes) {
      if (dLines[quote.id]) {
        for (const line of dLines[quote.id]) {
          dLineIdsToRemove[line._id] = true;
        }
      }
    }
    const ids = Object.keys(dLineIdsToRemove);

    const callback = () => {
      return updateTurnRequest(turnId, { videoQuotes: null }).then((data) => {
        dispatch({
          type: types.TURN_UPDATE_WIDGET,
          payload: {
            turnId: turnId,
            widgetId: widgetId,
            widget: {
              id: 'vq_1',
              show: false,
              duration: 0,
              quotes: [],
            },
          },
        });
      });
    };

    if (ids.length) {
      return dispatch(linesDelete(ids)).then(() => callback());
    }

    return callback();
  };

export const updateVideoQuotesWidget =
  (turnId, widgetId, widget) => (dispatch) => {
    return updateTurnRequest(turnId, { videoQuotes: widget }).then((data) => {
      dispatch({
        type: types.TURN_UPDATE_WIDGET,
        payload: {
          turnId: turnId,
          widgetId: widgetId,
          widget: withQuotesFallback(data.item.videoQuotes),
        },
      });
    });
  };

export const addAudioQuotesWidget =
  (turnId, editWidgetId, duration) => (dispatch, getState) => {
    const audioQuotes = {
      connectedTo: editWidgetId, // a_1
      duration,
      quotes: [
        {
          id: Math.floor(Date.now() / 1000),
          text: '',
          start: 0,
          active: false,
        },
      ],
    };
    return updateTurnRequest(turnId, { audioQuotes }).then((data) => {
      dispatch({
        type: types.TURN_UPDATE_WIDGET,
        payload: {
          turnId: turnId,
          widgetId: 'aq_1',
          widget: withQuotesFallback(data.item.audioQuotes),
        },
      });
    });
  };

export const deleteAudioQuotesWidget =
  (turnId, widgetId) => (dispatch, getState) => {
    const state = getState();
    const quotes = state.turns.d[turnId].dWidgets['aq_1'].quotes;
    const dLines = state.lines.dByTurnIdAndMarker[turnId];
    const dLineIdsToRemove = {};
    for (const quote of quotes) {
      if (dLines[quote.id]) {
        for (const line of dLines[quote.id]) {
          dLineIdsToRemove[line._id] = true;
        }
      }
    }
    const ids = Object.keys(dLineIdsToRemove);

    const callback = () => {
      return updateTurnRequest(turnId, { audioQuotes: null }).then((data) => {
        dispatch({
          type: types.TURN_UPDATE_WIDGET,
          payload: {
            turnId: turnId,
            widgetId: widgetId,
            widget: {
              id: 'aq_1',
              show: false,
              duration: 0,
              quotes: [],
            },
          },
        });
      });
    };

    if (ids.length) {
      return dispatch(linesDelete(ids)).then(() => callback());
    }

    return callback();
  };

export const updateAudioQuotesWidget =
  (turnId, widgetId, widget) => (dispatch) => {
    return updateTurnRequest(turnId, { audioQuotes: widget }).then((data) => {
      dispatch({
        type: types.TURN_UPDATE_WIDGET,
        payload: {
          turnId: turnId,
          widgetId: widgetId,
          widget: withQuotesFallback(data.item.audioQuotes),
        },
      });
    });
  };

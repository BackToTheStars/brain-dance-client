import * as types from './types';
import { getTurnsByIdsRequest, turnOpsRequest } from '../requests';
import { TurnHelper } from './helpers';
import { TURN_OPS_MAX, applyTurnOps } from './turnOps';
import { rowsToPreviewParagraph } from '../components/widgets/translation/rows';
import { castSaved } from '@/modules/presence/redux/actions';

// Не в actions.js: castSaved тянет socket → refresh → actions.js, импорт оттуда замкнул бы цикл.

// Запросы операций одного хода идут по одному, в порядке вызовов.
const tails = new Map();
const inTurnQueue = (turnId, job) => {
  const run = (tails.get(turnId) || Promise.resolve()).then(job);
  const tail = run.then(
    () => {},
    () => {},
  );
  tails.set(turnId, tail);
  tail.then(() => {
    if (tails.get(turnId) === tail) tails.delete(turnId);
  });
  return run;
};

// request() при отказе сервера свой промис не завершает; здесь завершается любой исход.
const settled = (send) =>
  new Promise((resolve, reject) => {
    send({
      errorCallback: (message, info) => reject(Object.assign(new Error(message), info)),
    }).then(resolve, (err) => reject(new Error(String(err))));
  });

// Место под fields.set с превью остаётся в каждом запросе.
const CHUNK = TURN_OPS_MAX - 1;
const chunksOf = (ops) => {
  if (!Array.isArray(ops) || ops.length <= CHUNK) return [ops];
  const chunks = [];
  for (let start = 0; start < ops.length; start += CHUNK) {
    chunks.push(ops.slice(start, start + CHUNK));
  }
  return chunks;
};

// Превью хода перевода считается от рядов стора после операций (не от формы) и едет тем же
// запросом, если отличается от хранимого абзаца.
const withPreview = (turn, ops) => {
  if (turn?.contentType !== 'translation') return ops;
  if (ops.some((op) => op.op === 'fields.set' && 'paragraph' in op.fields)) return ops;
  const { rows } = applyTurnOps({ rows: turn.dWidgets?.tr_1?.rows }, ops);
  const paragraph = rowsToPreviewParagraph(rows);
  return JSON.stringify(paragraph) === JSON.stringify(turn.paragraph)
    ? ops
    : [...ops, { op: 'fields.set', fields: { paragraph } }];
};

const applyToStore = (turnId, ops, opsVersion) => ({
  type: types.TURN_APPLY_OPS,
  // updatedAt — знак карточке пересчитать высоту, как после записи хода формой
  payload: { turnId, ops, opsVersion, updatedAt: new Date().toISOString() },
});

const send = async (dispatch, getState, turnId, chunk) => {
  const ops = withPreview(getState().turns.d[turnId], chunk);
  const { version } = await settled((options) => turnOpsRequest(turnId, ops, options));
  const turn = getState().turns.d[turnId];
  if (!turn) return version;
  if (version === (turn.opsVersion || 0) + 1) {
    dispatch(applyToStore(turnId, ops, version));
    return version;
  }
  // версия ушла дальше своей записи: ход менял кто-то ещё — перечитывается один этот ход
  try {
    const { items } = await settled((options) => getTurnsByIdsRequest([turnId], options));
    dispatch({
      type: types.TURNS_LOAD_DATA,
      payload: { turns: items.map((item) => TurnHelper.toNewFields(item)) },
    });
  } catch {
    dispatch(applyToStore(turnId, ops, version));
  }
  return version;
};

// Сохранить операции над ходом ({ op: 'row.set' | 'row.insert' | 'row.remove' | 'fields.set', … }).
// Стор обновляется после ответа сервера теми же операциями; список длиннее предела уходит
// несколькими запросами подряд. callbacks: success({ version }), error(message, { status,
// errorCode }) — отказ без alert. cast: false — спутникам сообщит вызывающий. Возвращает промис
// { version } или { error }, который не отклоняется.
export const saveTurnOps =
  ({ turnId, ops, cast = true }, callbacks) =>
  (dispatch, getState) => {
    let sent = false;
    return inTurnQueue(turnId, async () => {
      const chunks = chunksOf(ops);
      // весь список проверяется до первого запроса
      chunks.forEach((chunk) => applyTurnOps({ rows: [] }, chunk));
      let version;
      for (const chunk of chunks) {
        version = await send(dispatch, getState, turnId, chunk);
        sent = true;
      }
      return version;
    })
      .catch((error) => ({ error }))
      .then((result) => {
        if (sent && cast) dispatch(castSaved());
        if (result?.error) {
          const { error } = result;
          const message = error?.message || String(error);
          callbacks?.error?.(message, { status: error?.status, errorCode: error?.errorCode });
          return { error: message };
        }
        callbacks?.success?.({ version: result });
        return { version: result };
      });
  };

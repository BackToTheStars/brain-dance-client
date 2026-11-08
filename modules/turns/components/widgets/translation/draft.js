// Черновик рядов перевода в форме хода. База — ряды, которые форма считает сохранёнными: при
// открытии — ряды хода из стора, после своего сохранения — те же операции поверх прежней базы.
// Из базы и рядов формы: состояние ряда, операции одного ряда и всех несохранённых. Чистый модуль.

import { applyTurnOps } from '../../../redux/turnOps';
import { normalizeRows } from './rows';

const text = (value) => (typeof value === 'string' ? value : '');
const list = (rows) => (Array.isArray(rows) ? rows : []);

export const rowHasText = (row) =>
  !!row && (text(row.left).trim() !== '' || text(row.right).trim() !== '');

// Указатель базы считается раз на массив: ряд ищется без прохода по ней.
const indexes = new WeakMap();
const NO_BASE = { byId: new Map(), onlyText: null };
const indexOf = (base) => {
  if (!Array.isArray(base)) return NO_BASE;
  let index = indexes.get(base);
  if (!index) {
    const withText = base.filter(rowHasText);
    index = {
      byId: new Map(base.map((row) => [row.id, row])),
      onlyText: withText.length === 1 ? withText[0].id : null,
    };
    indexes.set(base, index);
  }
  return index;
};

export const savedRow = (base, id) => indexOf(base).byId.get(id);

// id единственного сохранённого ряда с текстом: его нельзя ни удалить, ни сохранить пустым —
// ход без рядов с текстом не принимается. null — таких рядов несколько или нет.
export const onlyTextRowId = (base) => indexOf(base).onlyText;

// Останется ли ход без текста, если снять ряды ids (те, чьё удаление уже в пути, и новый).
export const leavesNoText = (base, ids) => {
  const withText = list(base).filter(rowHasText);
  return withText.length > 0 && withText.every((row) => ids.includes(row.id));
};

// { state, left, right }: saved — как в базе, dirty — отличается (left / right — какими
// сторонами), new — в базе нет; у нового ряда изменённой считается сторона с текстом.
export const rowState = (saved, row) => {
  if (!saved) {
    const filled = rowHasText(row);
    return { state: 'new', left: filled && row.left !== '', right: filled && row.right !== '' };
  }
  const left = saved.left !== row.left;
  const right = saved.right !== row.right;
  return { state: left || right ? 'dirty' : 'saved', left, right };
};

const setOf = (saved, row) => {
  const op = { op: 'row.set', id: row.id };
  if (saved.left !== row.left) op.left = row.left;
  if (saved.right !== row.right) op.right = row.right;
  return 'left' in op || 'right' in op ? op : null;
};

const insertOf = (row, after) => ({
  op: 'row.insert',
  after,
  row: { id: row.id, left: row.left, right: row.right },
});

// Операции одного ряда формы; [] — сохранять нечего. Изменённый ряд — только изменённые стороны,
// опустошённый — удаление, новый пустой не уходит. Новый ряд встаёт после ближайшего сохранённого
// ряда выше (null — в начало): порядок сходится, в каком бы порядке ряды ни сохраняли.
export const rowOps = (base, rows, id) => {
  const { byId } = indexOf(base);
  const index = list(rows).findIndex((row) => row.id === id);
  if (index < 0) return [];
  const row = rows[index];
  const saved = byId.get(id);
  if (saved) {
    const set = setOf(saved, row);
    if (!set) return [];
    return [rowHasText(row) ? set : { op: 'row.remove', id }];
  }
  if (!rowHasText(row)) return [];
  let after = null;
  for (let i = index - 1; i >= 0 && after === null; i -= 1) {
    if (byId.has(rows[i].id)) after = rows[i].id;
  }
  return [insertOf(row, after)];
};

// Операции всех несохранённых рядов, сверху вниз. Первыми снимаются ряды базы, которых в форме
// уже нет; сохранённый ряд, пустой в форме, снимается. after нового ряда — ближайший ряд выше,
// который есть на сервере после предыдущих операций этого же списка.
export const draftOps = (base, rows) => {
  const { byId } = indexOf(base);
  const kept = new Set(list(rows).map((row) => row.id));
  const ops = list(base)
    .filter((row) => !kept.has(row.id))
    .map((row) => ({ op: 'row.remove', id: row.id }));
  let above = null;
  for (const row of list(rows)) {
    const saved = byId.get(row.id);
    if (!rowHasText(row)) {
      if (saved) ops.push({ op: 'row.remove', id: row.id });
      continue;
    }
    if (!saved) {
      ops.push(insertOf(row, above));
    } else if (saved !== row) {
      const set = setOf(saved, row);
      if (set) ops.push(set);
    }
    above = row.id;
  }
  return ops;
};

// Есть ли несохранённое. Зовётся на каждое нажатие: нетронутый ряд — тот же объект, что в базе,
// и отсекается сравнением ссылок; первый изменённый ряд завершает проход. Сохранённый пустой
// ряд без правок изменением не считается, хотя общий Save его снимет.
export const hasDraftChanges = (base, rows) => {
  const { byId } = indexOf(base);
  let found = 0;
  for (const row of list(rows)) {
    const saved = byId.get(row.id);
    if (!saved) {
      if (rowHasText(row)) return true;
      continue;
    }
    found += 1;
    if (saved !== row && (saved.left !== row.left || saved.right !== row.right)) return true;
  }
  return found !== byId.size;
};

// База после успешного сохранения: те же операции поверх прежней базы.
export const advanceBase = (base, ops) =>
  ops.length ? applyTurnOps({ rows: list(base) }, ops).rows : list(base);

// Черновик в форме хода: ряды — form.rows, база — form.rowsBase (ключ вне полей хода, в запись
// не идёт). Базу сеет редактор рядов при первом показе; до того черновика нет.
export const seedBase = (form) => (form.rowsBase ? {} : { rowsBase: normalizeRows(form.rows) });

export const baseSaved = (ops) => (form) =>
  form.rowsBase ? { rowsBase: advanceBase(form.rowsBase, ops) } : {};

export const formDraftOps = (form) => (form?.rowsBase ? draftOps(form.rowsBase, form.rows) : []);

export const formHasDraft = (form, template) =>
  template === 'translation' && !!form?.rowsBase && hasDraftChanges(form.rowsBase, form.rows);

// Операции над частью хода: правила те же, что на сервере, и сверяются с ним общим файлом
// примеров. Чистый модуль без импортов — им пользуются стор, сохранение и форма.

export const TURN_OPS_MAX = 500;
export const TURN_OPS_FIELDS = ['header', 'dontShowHeader', 'date', 'sourceUrl', 'languages', 'paragraph'];

const ROW_OPS = ['row.set', 'row.insert', 'row.remove'];

const invalid = (message) => Object.assign(new Error(message), { status: 400 });
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const isId = (value) => typeof value === 'string' && value !== '';
const isText = (value) => value === undefined || typeof value === 'string';
const isTextOrNull = (value) => value === null || typeof value === 'string';
const text = (value) => (typeof value === 'string' ? value : '');

const FIELD_CHECKS = {
  header: (value) => typeof value === 'string',
  dontShowHeader: (value) => typeof value === 'boolean',
  date: isTextOrNull,
  sourceUrl: isTextOrNull,
  languages: (value) =>
    isObject(value) &&
    Object.keys(value).every((key) => (key === 'left' || key === 'right') && typeof value[key] === 'string'),
  paragraph: Array.isArray,
};

const isStoredRow = (row) => {
  const keys = Object.keys(row);
  return (
    keys.length === 3 &&
    keys[0] === 'id' &&
    keys[1] === 'left' &&
    keys[2] === 'right' &&
    typeof row.left === 'string' &&
    typeof row.right === 'string'
  );
};

// Битые записи и повтор id отбрасываются; ряд в хранимой форме остаётся тем же объектом.
const storedRows = (rows) => {
  const seen = new Set();
  const result = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || !isId(row.id) || seen.has(row.id)) continue;
    seen.add(row.id);
    result.push(isStoredRow(row) ? row : { id: row.id, left: text(row.left), right: text(row.right) });
  }
  return result;
};

const checkOp = (op) => {
  if (!isObject(op) || typeof op.op !== 'string') throw invalid('An operation must be an object with «op»');
  switch (op.op) {
    case 'row.set':
      if (!isId(op.id)) throw invalid('row.set: «id» must be a non-empty string');
      if (!isText(op.left) || !isText(op.right)) throw invalid('row.set: a side must be a string');
      if (op.left === undefined && op.right === undefined) throw invalid('row.set: «left» or «right» expected');
      return;
    case 'row.insert':
      if (!isObject(op.row) || !isId(op.row.id)) throw invalid('row.insert: «row.id» must be a non-empty string');
      if (!isText(op.row.left) || !isText(op.row.right)) throw invalid('row.insert: a side must be a string');
      if (!('after' in op) || !(op.after === null || isId(op.after))) {
        throw invalid('row.insert: «after» must be a row id or null');
      }
      return;
    case 'row.remove':
      if (!isId(op.id)) throw invalid('row.remove: «id» must be a non-empty string');
      return;
    case 'fields.set': {
      if (!isObject(op.fields) || !Object.keys(op.fields).length) throw invalid('fields.set: «fields» expected');
      for (const [key, value] of Object.entries(op.fields)) {
        if (!TURN_OPS_FIELDS.includes(key)) throw invalid(`fields.set: field "${key}" is not allowed`);
        if (!FIELD_CHECKS[key](value)) throw invalid(`fields.set: wrong value of "${key}"`);
      }
      return;
    }
    default:
      throw invalid(`Unknown operation "${op.op}"`);
  }
};

export const hasRowOps = (ops) => ops.some((op) => ROW_OPS.includes(op.op));

// Сначала проверяется весь список (ошибка — Error со status 400, ничего не применено), потом
// операции идут по порядку. { rows, fields }: ряды после операций и поля к записи; нетронутые
// ряды — те же объекты, что во входе.
export const applyTurnOps = (turn, ops) => {
  if (!Array.isArray(ops) || !ops.length) throw invalid('«ops» must be a non-empty array');
  if (ops.length > TURN_OPS_MAX) throw invalid(`«ops»: at most ${TURN_OPS_MAX} operations`);
  ops.forEach(checkOp);

  const rows = storedRows(turn?.rows);
  const fields = {};
  const indexOf = (id) => rows.findIndex((row) => row.id === id);
  const setSides = (index, { left, right }) => {
    const row = rows[index];
    const next = { id: row.id, left: left ?? row.left, right: right ?? row.right };
    if (next.left !== row.left || next.right !== row.right) rows[index] = next;
  };
  const newRow = ({ id, left, right }) => ({ id, left: left ?? '', right: right ?? '' });

  for (const op of ops) {
    if (op.op === 'row.set') {
      const index = indexOf(op.id);
      if (index >= 0) setSides(index, op);
      else rows.push(newRow(op));
    } else if (op.op === 'row.insert') {
      const index = indexOf(op.row.id);
      if (index >= 0) {
        setSides(index, op.row);
      } else if (op.after === null) {
        rows.unshift(newRow(op.row));
      } else {
        const after = indexOf(op.after);
        if (after >= 0) rows.splice(after + 1, 0, newRow(op.row));
        else rows.push(newRow(op.row));
      }
    } else if (op.op === 'row.remove') {
      const index = indexOf(op.id);
      if (index >= 0) rows.splice(index, 1);
    } else {
      Object.assign(fields, op.fields);
    }
  }
  return { rows, fields };
};

const hasRowContent = (row) => row.left.trim() !== '' || row.right.trim() !== '';
const HEADER_FIELDS = ['header', 'dontShowHeader', 'date', 'sourceUrl'];

// Те же операции над ходом в виде стора (dWidgets): ряды и языки — в tr_1, заголовок, дата и
// источник — в h_1 / s_1, абзац — в p_1. Виджеты, которых операции не касались, остаются теми же
// объектами. extra — поля хода поверх (opsVersion из ответа сервера).
export const applyOpsToStoreTurn = (turn, ops, extra = {}) => {
  const widget = turn.dWidgets.tr_1;
  const { rows, fields } = applyTurnOps({ rows: widget?.rows }, ops);
  const dWidgets = { ...turn.dWidgets };
  const next = { ...turn, ...extra, dWidgets };
  const isTranslation = turn.contentType === 'translation';
  const rowsTouched = hasRowOps(ops);

  if (widget && (rowsTouched || 'languages' in fields)) {
    dWidgets.tr_1 = {
      ...widget,
      rows: rowsTouched ? rows : widget.rows,
      languages:
        'languages' in fields
          ? { left: text(fields.languages.left).trim(), right: text(fields.languages.right).trim() }
          : widget.languages,
      show: isTranslation && rows.some(hasRowContent),
    };
  }

  if (HEADER_FIELDS.some((key) => key in fields)) {
    const header = 'header' in fields ? fields.header : turn.dWidgets.h_1.text;
    const dontShowHeader =
      'dontShowHeader' in fields ? fields.dontShowHeader : (turn.dontShowHeader ?? !turn.dWidgets.h_1.show);
    const date = 'date' in fields ? fields.date : turn.date;
    const sourceUrl = 'sourceUrl' in fields ? fields.sourceUrl : turn.sourceUrl;
    const hidden = !!dontShowHeader || !text(header).trim();
    Object.assign(next, { dontShowHeader: !!dontShowHeader, date, sourceUrl });
    dWidgets.h_1 = { ...turn.dWidgets.h_1, show: !hidden, text: header };
    dWidgets.s_1 = { ...turn.dWidgets.s_1, show: (!!sourceUrl || !!date) && hidden, date, url: sourceUrl };
  }

  if ('paragraph' in fields) {
    next.paragraph = fields.paragraph;
    dWidgets.p_1 = {
      ...turn.dWidgets.p_1,
      inserts: fields.paragraph,
      show: !isTranslation && turn.contentType !== 'md' && !!fields.paragraph.length,
    };
  }

  const widgetToShow = Object.values(dWidgets)
    .filter((item) => item.show)
    .map(({ type, id }) => ({ type, id }));
  if (JSON.stringify(widgetToShow) !== JSON.stringify(turn.widgetToShow)) next.widgetToShow = widgetToShow;
  return next;
};

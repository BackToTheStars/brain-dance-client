// Редактор хода «Перевод текста» на месте Quill: языки колонок, ряды из двух textarea
// md-исходника, полоса действий ряда (сохранить ряд, «+» — ряд после него, удаление), Preview той
// же сеткой, что карточка. Ряды живут в form.rows (changeHandler), языки — в form.languages
// (patchForm), сохранённое — в черновике рядов (draft.js). Сохранение ряда и удаление
// сохранённого ряда уходят на сервер сразу; у нового хода и при смене типа — только общим Save.
// Textarea и полоса действий — только у рядов в окне прокрутки тела с запасом, у ряда с фокусом,
// у только что добавленного и у ряда с запросом в пути; ряды вне окна подряд — один пустой
// разделитель (data-spacer) суммарной высоты их оценок, а после первой отрисовки — замеров
// (useVisibleParts): элементов в теле — по окну, не по числу рядов. Высота ячеек —
// не autoSize antd (он мерил каждую textarea отдельно скрытым textarea в body: принудительная
// вёрстка документа на каждую), а один пакет замеров на коммит: все чтения, потом все записи.

import { TID } from '@/config/testIds';
import { DeleteOutlined, LoadingOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import { useTranslations } from 'next-intl';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMdMarkVars } from '../md/MdHtml';
import { useMdRenderer } from '../md/mdRenderer';
import { useVisibleParts } from '../parts/useVisibleParts';
import TranslationGrid from './TranslationGrid';
import {
  baseSaved,
  leavesNoText,
  onlyTextRowId,
  rowHasText,
  rowOps,
  rowState,
  savedRow,
  seedBase,
} from './draft';
import { dropEmptyRows, emptyRow, formRows, normalizeLanguages } from './rows';

const SIDES = ['left', 'right'];
const CELL_PLACEHOLDER = { left: 'Original text (markdown)', right: 'Translation (markdown)' };
const LANGUAGE_PLACEHOLDER = { left: 'Language of the left column', right: 'Language of the right column' };
const MIN_ROWS = 2;
const NO_CONFIRM = { open: false, id: null, saved: false };
const NO_IDS = [];

// Размеры для оценки высоты ряда до отрисовки: кегль --editor-font-size по умолчанию (panels.scss),
// ширина знака моноширинного шрифта и высота строки textarea antd в долях кегля; отступы и рамка
// textarea, колонка кнопок с двумя промежутками сетки, отступы и линия ряда, две строки кнопок — px.
const EDITOR_FONT_DEFAULT = 22;
const CHAR_WIDTH = 0.6;
const LINE_HEIGHT = 1.5714;
const TEXTAREA_PADDING_X = 24;
const TEXTAREA_EXTRA_Y = 10;
const ACTIONS_COLUMN = 56 + 6 * 2;
const ROW_EXTRA = 8 * 2 + 1;
const ACTIONS_HEIGHT = 26 * 2 + 4 + 2;

const text = (value) => (typeof value === 'string' ? value : '');

const without = (rows, id) => {
  const next = rows.filter((row) => row.id !== id);
  return next.length ? next : [emptyRow()];
};

const putBack = (rows, { row, index }) => {
  if (rows.some((item) => item.id === row.id)) return rows;
  const next = [...rows];
  next.splice(Math.min(index, next.length), 0, row);
  return next;
};

// Знаки и абзацы ячеек считаются раз на объект ряда: оценка зовётся на каждый шаг прокрутки.
const metrics = new WeakMap();
const cellMetrics = (value) => {
  const source = text(value);
  let breaks = 0;
  for (let i = source.indexOf('\n'); i >= 0; i = source.indexOf('\n', i + 1)) breaks += 1;
  return { chars: source.length - breaks, breaks };
};
const rowMetrics = (row) => {
  let known = metrics.get(row);
  if (!known) {
    known = { left: cellMetrics(row.left), right: cellMetrics(row.right) };
    metrics.set(row, known);
  }
  return known;
};

const EMPTY_CELL = cellMetrics('');

// Знаков в строке textarea при ширине тела: ширина колонки за вычетом отступов textarea, знак
// моноширинного шрифта в долях кегля.
const charsPerLine = (width, fontSize) => {
  const textWidth = (width - ACTIONS_COLUMN) / 2 - TEXTAREA_PADDING_X;
  return Math.max(1, Math.floor(textWidth / (fontSize * CHAR_WIDTH)));
};
// Строк ячейки: по знакам плюс по строке на каждый перенос, не меньше minRows.
const linesOf = ({ chars, breaks }, perLine) => Math.max(MIN_ROWS, Math.ceil(chars / perLine) + breaks);

// Оценка высоты ряда редактора: строки большей ячейки по кеглю, отступы и рамка textarea, не ниже
// двух строк кнопок, плюс отступы и линия ряда.
export const estimateEditorRowHeight = (row, box, fontSize = EDITOR_FONT_DEFAULT) => {
  const perLine = charsPerLine(box.width, fontSize);
  const { left, right } = row ? rowMetrics(row) : { left: EMPTY_CELL, right: EMPTY_CELL };
  const lines = Math.max(linesOf(left, perLine), linesOf(right, perLine));
  const cell = Math.ceil(lines * fontSize * LINE_HEIGHT) + TEXTAREA_EXTRA_Y;
  return Math.max(cell, ACTIONS_HEIGHT) + ROW_EXTRA;
};

// Ячейки редактора: ключ «ряд + сторона», textarea из ref antd (или сам узел), метрика ячейки из
// вычисленного стиля — у всех ячеек она одна, пока не сменился кегль.
const CELL_KEY_SEP = '\u0000';
const cellKey = (id, side) => `${id}${CELL_KEY_SEP}${side}`;
const cellRowId = (key) => key.slice(0, key.lastIndexOf(CELL_KEY_SEP));
const cellSide = (key) => key.slice(key.lastIndexOf(CELL_KEY_SEP) + 1);
const textareaOf = (handle) =>
  handle && 'scrollHeight' in handle ? handle : handle?.resizableTextArea?.textArea || null;
// scrollHeight целый, строки дробные: высота — целое число строк по вычисленной высоте строки,
// иначе рамка ячейки то на доли пикселя короче текста, то длиннее.
const cellMetric = (el) => {
  const style = getComputedStyle(el);
  const px = (name) => parseFloat(style[name]) || 0;
  const lineHeight = px('lineHeight') || px('fontSize') * LINE_HEIGHT;
  const padding = px('paddingTop') + px('paddingBottom');
  const frame = style.boxSizing === 'content-box' ? 0 : padding + px('borderTopWidth') + px('borderBottomWidth');
  return (scrollHeight) => {
    if (!scrollHeight) return 0;
    const lines = Math.max(MIN_ROWS, Math.round((scrollHeight - padding) / lineHeight));
    return Math.round((lines * lineHeight + frame) * 100) / 100;
  };
};
// Пакет замеров: сброс высоты и чтение scrollHeight у всех — одна принудительная вёрстка на
// пакет, затем записи. Ячейка с нулевым scrollHeight не отрисована (скрыта) — ей высоту не писать.
const fitCells = (fit, measure, apply) => {
  for (const item of measure) item.el.style.height = '0px';
  if (!fit.metric) fit.metric = cellMetric(measure[0].el);
  for (const item of measure) item.height = fit.metric(item.el.scrollHeight);
  for (const item of measure) {
    if (item.height) fit.known.set(item.key, { text: item.text, height: item.height });
    apply.push([item.el, item.height]);
  }
  for (const [el, height] of apply) el.style.height = height ? `${height}px` : '';
};
const refitAll = (fit, fontChanged) => {
  fit.all = true;
  fit.known.clear();
  if (fontChanged) fit.metric = null;
};

// Предпросмотр показывает то, что уйдёт в ход: без пустых рядов, языки обрезаны. Его корень —
// скроллер сетки: ряды вне окна она рисует заглушками. Сетка монтируется после того, как корень
// попал в ref: иначе её хук увидел бы пустой ref и отрисовал все ряды разом.
const Preview = ({ rows, languages }) => {
  const t = useTranslations('Game.translation');
  const markVars = useMdMarkVars();
  const ready = !!useMdRenderer();
  const pane = useRef(null);
  const [mounted, setMounted] = useState(false);
  const bindPane = useCallback((el) => {
    if (!el) return;
    pane.current = el;
    setMounted(true);
  }, []);
  const shown = dropEmptyRows(rows);
  return (
    <div
      className="md-editor__preview translation-preview"
      ref={bindPane}
      data-test-id={TID.translation.editor.previewPane}
      style={markVars}
    >
      {!shown.length ? (
        <div className="md-editor__placeholder">Nothing to preview yet</div>
      ) : ready && mounted ? (
        <TranslationGrid rows={shown} languages={normalizeLanguages(languages)} scrollRef={pane} />
      ) : (
        <div className="md-editor__placeholder" data-test-id={TID.translation.loading}>
          {t('loading')}
        </div>
      )}
    </div>
  );
};

// Ряд — memo с устойчивыми пропсами: набор текста в ячейке перерисовывает только свой ряд.
// live — ряды ходят на сервер по одному; last — единственный сохранённый ряд с текстом;
// rows у textarea — оценка до замера, после замера высота стоит инлайном.
const EditorRow = memo(({ row, saved, live, busy, last, actions, titles, measureRef, cellRefs, perLine }) => {
  const editor = TID.translation.editor;
  const dirty = rowState(saved, row);
  const metric = rowMetrics(row);
  const filled = rowHasText(row);
  const keep = live && last;
  const emptied = dirty.state === 'dirty' && !filled;
  const canSave =
    live && !busy && (dirty.state === 'dirty' ? !(emptied && keep) : dirty.state === 'new' && filled);
  const saveTitle = !live ? titles.detached : emptied && keep ? titles.last : titles.save;

  return (
    <div
      className="translation-editor__row"
      ref={measureRef}
      data-test-id={editor.row}
      data-row-id={row.id}
      data-row-state={dirty.state}
      data-busy={busy ? 'true' : undefined}
      onFocus={() => actions.focus(row.id)}
      onBlur={() => actions.blur(row.id)}
    >
      {SIDES.map((side) => (
        <Input.TextArea
          key={side}
          ref={cellRefs[side]}
          className="translation-editor__cell"
          data-test-id={editor.cell}
          data-side={side}
          data-dirty={dirty[side] ? 'true' : undefined}
          value={row[side]}
          rows={linesOf(metric[side], perLine)}
          placeholder={CELL_PLACEHOLDER[side]}
          onChange={(e) => actions.cell(row.id, side, e.target.value)}
        />
      ))}
      <div className="translation-editor__actions">
        <button
          type="button"
          className="md-editor__tool translation-editor__save"
          title={saveTitle}
          disabled={!canSave}
          data-test-id={editor.saveRow}
          data-row-id={row.id}
          onClick={() => actions.save(row.id)}
        >
          {busy ? <LoadingOutlined /> : <SaveOutlined />}
        </button>
        <button
          type="button"
          className="md-editor__tool"
          title="Add a row below"
          data-test-id={editor.addRowAfter}
          data-row-id={row.id}
          onClick={() => actions.addAfter(row.id)}
        >
          <PlusOutlined />
        </button>
        <button
          type="button"
          className="md-editor__tool"
          title={keep ? titles.last : 'Delete the row'}
          disabled={busy || keep}
          data-test-id={editor.deleteRow}
          data-row-id={row.id}
          data-last-row={keep ? 'true' : undefined}
          onClick={() => actions.remove(row.id)}
        >
          <DeleteOutlined />
        </button>
      </div>
    </div>
  );
});

// aside — подпись поля из формы; saveTurnOps — действие записи операций (форма передаёт его
// сама: импорт отсюда замкнул бы settings → редактор → сокет → действия ходов → settings).
const TranslationEditor = ({
  changeHandler,
  prefixClass,
  value,
  form,
  patchForm,
  edition,
  setError,
  saveTurnOps,
  aside = null,
}) => {
  const t = useTranslations('Game.turnForm');
  const dispatch = useDispatch();
  const turnId = useSelector((state) => state.panels.editTurnId);
  const live = useSelector(
    (state) => state.turns.d[state.panels.editTurnId]?.contentType === 'translation',
  );
  const [preview, setPreview] = useState(false);
  // окно удаления ряда с текстом; saved — ряд удалится на сервере сразу
  const [confirm, setConfirm] = useState(NO_CONFIRM);
  // id рядов, чей запрос в пути
  const [pending, setPending] = useState({});
  // ряд с фокусом и только что добавленный ряд рисуются независимо от окна прокрутки
  const [focused, setFocused] = useState(null);
  const added = useRef(null);
  const removing = useRef(new Set());
  const rows = useMemo(() => formRows(value), [value]);
  const seeded = !!form?.rowsBase;
  // до посева базы (рендер сразу после заливки формы) сохранённым считается то, что в форме
  const base = seeded ? form.rowsBase : rows;
  const languages = form?.languages || {};
  const editor = TID.translation.editor;
  const lastTitle = t('translation.lastRow');

  useEffect(() => {
    if (!seeded) patchForm(seedBase);
  }, [seeded]);

  const now = useRef(null);
  now.current = { rows, base, live, turnId, changeHandler, patchForm, edition, setError, saveTurnOps, lastTitle };

  // Скроллер рядов. Ref-колбэк пропускает null (тело снято на время Preview — хук держит прежний
  // элемент, а не считает окно бесконечным) и перерисовывает редактор, когда тело смонтировано
  // заново: хук подключается к новому элементу.
  const body = useRef(null);
  const [, bodyMounted] = useReducer((n) => n + 1, 0);
  const bindBody = useCallback((el) => {
    if (!el || el === body.current) return;
    body.current = el;
    bodyMounted();
  }, []);
  // Замер ячеек: смонтированные textarea по ключу ряд + сторона, очередь ключей к замеру в этом
  // коммите, память высот по тексту при текущей ширине и кегле, ref-колбэки ячеек — одни на
  // жизнь ряда (antd зовёт ref на каждом рендере, поэтому замер только у новой textarea).
  const fit = useRef(null);
  if (!fit.current) {
    fit.current = {
      cells: new Map(),
      seen: new Map(),
      known: new Map(),
      refs: new Map(),
      queue: new Set(),
      all: false,
      metric: null,
      width: 0,
    };
  }
  const f = fit.current;
  const cellRefs = useCallback((id) => {
    let refs = f.refs.get(id);
    if (!refs) {
      const bind = (side) => (handle) => {
        const key = cellKey(id, side);
        const el = textareaOf(handle);
        if (!el) {
          f.cells.delete(key);
          return;
        }
        f.cells.set(key, el);
        if (f.seen.get(key) === el) return;
        f.seen.set(key, el);
        f.queue.add(key);
      };
      refs = { left: bind('left'), right: bind('right') };
      f.refs.set(id, refs);
    }
    return refs;
  }, []);
  // Кегль ячеек — переменная формы на обёртке редактора; читается после каждого рендера, до
  // замеров хука (эффект объявлен раньше него). Смена кегля — перемерить все ячейки.
  const fontSize = useRef(EDITOR_FONT_DEFAULT);
  // счётчик смен кегля: новая функция оценки — хук окна забывает оценки, снятые при прежнем кегле
  const [fontChanges, fontChanged] = useReducer((n) => n + 1, 0);
  useLayoutEffect(() => {
    if (!body.current) return;
    const declared = parseFloat(getComputedStyle(body.current).getPropertyValue('--editor-font-size'));
    const next = declared > 0 ? declared : EDITOR_FONT_DEFAULT;
    if (next === fontSize.current) return;
    fontSize.current = next;
    refitAll(f, true);
    fontChanged();
  });

  // Список id устойчив, пока не меняется порядок рядов: набор текста не трогает окно.
  const idsRef = useRef(NO_IDS);
  const ids = useMemo(() => {
    const next = rows.map((row) => row.id);
    const prev = idsRef.current;
    if (prev.length === next.length && prev.every((id, i) => id === next[i])) return prev;
    idsRef.current = next;
    return next;
  }, [rows]);
  const indexById = useMemo(() => new Map(ids.map((id, i) => [id, i])), [ids]);
  const estimate = useCallback(
    (id, box) => estimateEditorRowHeight(now.current.rows[indexById.get(id)], box, fontSize.current),
    [indexById, fontChanges],
  );
  const always = useMemo(
    () => [focused, added.current, ...Object.keys(pending)].filter(Boolean),
    [focused, pending, ids],
  );
  const { visible, heightOf, measureRef, box } = useVisibleParts({ scrollRef: body, ids, estimate, always });
  const width = box ? box.width : 0;
  const perLine = charsPerLine(width, fontSize.current);

  // Ряды сняты — их ячейки забыть.
  useLayoutEffect(() => {
    for (const id of f.refs.keys()) if (!indexById.has(id)) f.refs.delete(id);
    for (const map of [f.seen, f.known]) {
      for (const key of map.keys()) if (!indexById.has(cellRowId(key))) map.delete(key);
    }
  }, [indexById]);

  // После каждого коммита: новые ячейки и ячейки с набранным текстом — одним пакетом; смена
  // ширины тела — все смонтированные. Ячейка с тем же текстом, что помнится, берёт высоту без
  // чтения (ряд вернулся в окно).
  useLayoutEffect(() => {
    if (width !== f.width) {
      f.width = width;
      refitAll(f);
    }
    const measure = [];
    const apply = [];
    for (const key of f.all ? f.cells.keys() : f.queue) {
      const el = f.cells.get(key);
      const row = now.current.rows[indexById.get(cellRowId(key))];
      if (!el || !row) continue;
      const value = text(row[cellSide(key)]);
      const remembered = f.known.get(key);
      if (remembered && remembered.text === value) apply.push([el, remembered.height]);
      else measure.push({ key, el, text: value });
    }
    f.all = false;
    f.queue.clear();
    if (measure.length) fitCells(f, measure, apply);
    else for (const [el, height] of apply) el.style.height = `${height}px`;
  });

  // «+ Row» в конце — тело прокручивается к новому ряду после его отрисовки и замера
  const scrollToEnd = useRef(false);
  useLayoutEffect(() => {
    if (!scrollToEnd.current || !body.current) return;
    scrollToEnd.current = false;
    body.current.scrollTop = body.current.scrollHeight;
  });

  // Обработчики одни на всё время жизни редактора и читают текущее из now.
  const actions = useMemo(() => {
    // Ход нельзя оставить без рядов с текстом — и двумя удалениями подряд, пока первое в пути.
    const blocked = (id) => {
      const { base, setError, lastTitle } = now.current;
      if (!leavesNoText(base, [...removing.current, id])) return false;
      setError({ message: lastTitle });
      return true;
    };
    // Операции ряда — одним запросом; после ответа двигается база, форма остаётся открытой.
    // lost — ряд, уже снятый из формы: при отказе он возвращается на место.
    const send = (id, ops, lost) => {
      const { turnId, edition, saveTurnOps } = now.current;
      const token = edition.token();
      const removes = ops[0].op === 'row.remove';
      if (removes && blocked(id)) return false;
      if (removes) removing.current.add(id);
      setPending((prev) => ({ ...prev, [id]: true }));
      dispatch(saveTurnOps({ turnId, ops })).then((result) => {
        removing.current.delete(id);
        setPending(({ [id]: done, ...rest }) => rest);
        if (!edition.isCurrent(token)) return;
        const { patchForm, setError } = now.current;
        if (!result.error) {
          setError(null);
          return patchForm(baseSaved(ops));
        }
        setError({ message: result.error });
        if (lost) patchForm((form) => ({ rows: putBack(formRows(form.rows), lost) }));
      });
      return true;
    };
    // Сохранённый ряд уходит из формы, не дожидаясь ответа: ни новый ряд, ни общий Save не
    // должны опереться на него как на соседа сверху.
    const drop = (id) => {
      const { rows, base, live, changeHandler } = now.current;
      const index = rows.findIndex((row) => row.id === id);
      const sent = live && savedRow(base, id) ? send(id, [{ op: 'row.remove', id }], { row: rows[index], index }) : true;
      if (sent) changeHandler(without(rows, id));
    };
    const insert = (rows, index) => {
      const row = emptyRow();
      const next = [...rows];
      next.splice(index, 0, row);
      added.current = row.id;
      return next;
    };
    return {
      drop,
      cell: (id, side, text) => {
        const { rows, changeHandler } = now.current;
        f.queue.add(cellKey(id, side));
        changeHandler(rows.map((row) => (row.id === id ? { ...row, [side]: text } : row)));
      },
      addAfter: (id) => {
        const { rows, changeHandler } = now.current;
        changeHandler(insert(rows, rows.findIndex((row) => row.id === id) + 1));
      },
      addAtEnd: () => {
        const { rows, changeHandler } = now.current;
        scrollToEnd.current = true;
        changeHandler(insert(rows, rows.length));
      },
      save: (id) => {
        const { rows, base, live } = now.current;
        const ops = live ? rowOps(base, rows, id) : [];
        if (ops.length) send(id, ops);
      },
      // ряд с текстом (в форме или сохранённым) — через окно, пустой — сразу
      remove: (id) => {
        const { rows, base, live } = now.current;
        const saved = live ? savedRow(base, id) : undefined;
        const row = rows.find((item) => item.id === id);
        if (rowHasText(row) || rowHasText(saved)) setConfirm({ open: true, id, saved: !!saved });
        else drop(id);
      },
      focus: (id) => {
        if (added.current !== id) added.current = null;
        setFocused(id);
      },
      blur: (id) => setFocused((current) => (current === id ? null : current)),
    };
  }, [dispatch]);

  const saveTitle = t('translation.saveRow');
  const detachedTitle = t('translation.saveRowOff');
  const titles = useMemo(
    () => ({ save: saveTitle, detached: detachedTitle, last: lastTitle }),
    [saveTitle, detachedTitle, lastTitle],
  );

  const setLanguage = (side, text) =>
    patchForm((prev) => ({
      ...prev,
      languages: { ...(prev.languages || {}), [side]: text },
    }));
  const onlyText = live ? onlyTextRowId(base) : null;

  // Ряды окна — EditorRow, ряды вне окна подряд — один разделитель (как в TranslationGrid); для них
  // ничего не считается, кроме суммы высот. Один плоский список с ключами: ряд, оставшийся в окне,
  // не перемонтируется, когда отрезки вокруг него меняются.
  const parts = [];
  let hidden = [];
  const flushHidden = () => {
    if (!hidden.length) return;
    parts.push(
      <div
        className="translation-editor__row"
        key={`spacer\u0000${hidden[0]}`}
        data-test-id={editor.row}
        data-spacer="true"
        data-from={hidden[0]}
        data-to={hidden[hidden.length - 1]}
        data-count={hidden.length}
        style={{ height: hidden.reduce((sum, id) => sum + heightOf(id), 0) }}
      />,
    );
    hidden = [];
  };
  for (const id of ids) {
    if (!visible.has(id)) {
      hidden.push(id);
      continue;
    }
    flushHidden();
    const row = rows[indexById.get(id)];
    parts.push(
      <EditorRow
        key={id}
        row={row}
        saved={savedRow(base, id)}
        live={live}
        busy={!!pending[id]}
        last={onlyText === id}
        actions={actions}
        titles={titles}
        measureRef={measureRef(id)}
        cellRefs={cellRefs(id)}
        perLine={perLine}
      />,
    );
  }
  flushHidden();

  return (
    <div className="md-editor translation-editor" data-test-id={TID.addTurn.field(prefixClass)}>
      <div className="md-editor__bar">
        <div className="flex-1" />
        {aside}
        <button
          type="button"
          className="btn btn-primary md-editor__toggle"
          data-test-id={preview ? editor.source : editor.preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? 'Source' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <Preview rows={rows} languages={languages} />
      ) : (
        <div className="translation-editor__body" ref={bindBody}>
          <div className="translation-editor__languages">
            {SIDES.map((side) => (
              <Input
                key={side}
                className="translation-editor__language"
                data-test-id={editor.language}
                data-side={side}
                value={languages[side] || ''}
                placeholder={LANGUAGE_PLACEHOLDER[side]}
                onChange={(e) => setLanguage(side, e.target.value)}
              />
            ))}
            <div className="translation-editor__actions" />
          </div>
          {parts}
          <button
            type="button"
            className="btn btn-primary translation-editor__add"
            data-test-id={editor.addRow}
            onClick={actions.addAtEnd}
          >
            + Row
          </button>
        </div>
      )}

      {/* Окно контролируемое, а не Modal.confirm: статические методы antd не видят контекст темы. */}
      <Modal
        open={confirm.open}
        title={t('translation.deleteRow.Title')}
        okText={t('translation.deleteRow.Ok')}
        cancelText={t('translation.deleteRow.Cancel')}
        okButtonProps={{ danger: true, 'data-test-id': editor.deleteOk }}
        cancelButtonProps={{ 'data-test-id': editor.deleteCancel }}
        onCancel={() => setConfirm({ ...confirm, open: false })}
        onOk={() => {
          actions.drop(confirm.id);
          setConfirm({ ...confirm, open: false });
        }}
      >
        <p
          className="mb-0"
          data-test-id={editor.deleteConfirm}
          data-row-id={confirm.id || ''}
          data-saved={confirm.saved ? 'true' : undefined}
        >
          {t(confirm.saved ? 'translation.deleteRow.TextSaved' : 'translation.deleteRow.Text')}
        </p>
      </Modal>
    </div>
  );
};

export default TranslationEditor;

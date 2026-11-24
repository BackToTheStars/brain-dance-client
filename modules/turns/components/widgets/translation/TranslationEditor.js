// Редактор хода «Перевод текста» на месте Quill: в верхней полосе — кнопки обёртки выделенного
// (для ячейки, где был курсор) и языки колонок; ниже — ряды из двух textarea
// md-исходника или ячейки Visual (Quill на общем мосту статьи), полоса действий ряда
// (сохранить ряд, «+» — ряд после него, удаление), Preview той
// же сеткой, что карточка. Ряды живут в form.rows (changeHandler), языки — в form.languages
// (patchForm), сохранённое — в черновике рядов (draft.js). Сохранение ряда и удаление
// сохранённого ряда уходят на сервер сразу; у нового хода и при смене типа — только общим Save.
// Выделения ячеек — цитаты хода (quotes.js): перед сохранением ряда они получают id; сохранение
// и удаление ряда, с которыми уходят цитаты с линиями, — через окно потери линий, сами линии
// снимаются после ответа сервера.
// Textarea и полоса действий — только у рядов в окне прокрутки тела с запасом, у ряда с фокусом,
// у только что добавленного и у ряда с запросом в пути; ряды вне окна подряд — один пустой
// разделитель (data-spacer) суммарной высоты их оценок, а после первой отрисовки — замеров
// (useVisibleParts): элементов в теле — по окну, не по числу рядов. Высота ячеек —
// не autoSize antd (он мерил каждую textarea отдельно скрытым textarea в body: принудительная
// вёрстка документа на каждую), а один пакет замеров на коммит: все чтения, потом все записи.
// single — статья md: те же ряды одной колонкой (блок — left, right пустой), без языков; у блока
// ещё «склеить со следующим» и «разделить по курсору» (у сохранённой статьи уходят на сервер сразу,
// как удаление), в полосе — «скопировать всю статью». Изменённый блок, в котором оказалось
// несколько блоков (вставка с пустыми строками, больше предела), при сохранении делится на ряды.
// Статья без рядов (ещё не разделённый markdown) делится на блоки при открытии и пишется
// целиком первым общим Save.
// Режим — список в полосе: у статьи «Авто» и «Блоки» (Visual / Source) и Preview, у перевода Visual /
// Source / Preview. «Авто» — статья сплошным текстом без кнопок блока: блок делится и склеивается
// при наборе (autoBlocks.js), стрелки переходят между блоками; на сервер — тем же общим Save.

import { TID } from '@/config/testIds';
import {
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined,
  SaveOutlined,
  ScissorOutlined,
  VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import { Input, Modal, Select } from 'antd';
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
import { WRAPS, wrapSelection } from '../md/wrapTools';
import { centrePart, takeMiddleRow } from '../parts/middleRow';
import { useVisibleParts } from '../parts/useVisibleParts';
import TranslationGrid from './TranslationGrid';
import TranslationVisualCell from './TranslationVisualCell';
import { useTranslationWheel } from './useTranslationWheel';
import {
  advanceBase,
  baseSaved,
  draftBase,
  leavesNoText,
  onlyTextRowId,
  rowHasText,
  rowOps,
  rowState,
  savedRow,
  seedBase,
} from './draft';
import { autoMerge, autoSplit, listEnter } from './autoBlocks';
import { caretAfterIds, ensureRowQuoteIds, lostRowQuotes, quoteLinks } from './quotes';
import {
  dropEmptyRows,
  emptyRow,
  formRows,
  joinBlocks,
  newRowId,
  normalizeLanguages,
  rowsFromMarkdown,
  splitDraftRows,
} from './rows';

const SIDES = ['left', 'right'];
const SINGLE_SIDES = ['left'];
const CELL_PLACEHOLDER = { left: 'Original text (markdown)', right: 'Translation (markdown)' };
const LANGUAGE_PLACEHOLDER = { left: 'Language of the left column', right: 'Language of the right column' };
const MIN_ROWS = 2;
const NO_CONFIRM = { open: false, id: null, saved: false };
const NO_IDS = [];

// Режимы редактора; выбор у статьи помнит браузер для всех игр (Preview не запоминается).
const ARTICLE_MODES = ['auto-visual', 'auto-source', 'blocks-visual', 'blocks-source', 'preview'];
const TRANSLATION_MODES = ['visual', 'source', 'preview'];
const ARTICLE_MODE_DEFAULT = 'auto-visual';
const MODE_KEY = 'md_editor_mode';
const MODE_LABELS = {
  'auto-visual': 'autoVisual',
  'auto-source': 'autoSource',
  'blocks-visual': 'blocksVisual',
  'blocks-source': 'blocksSource',
  preview: 'preview',
  visual: 'visual',
  source: 'source',
};
const storedArticleMode = () => {
  try {
    const value = window.localStorage.getItem(MODE_KEY);
    return ARTICLE_MODES.includes(value) && value !== 'preview' ? value : ARTICLE_MODE_DEFAULT;
  } catch {
    return ARTICLE_MODE_DEFAULT;
  }
};
const storeArticleMode = (value) => {
  try {
    window.localStorage.setItem(MODE_KEY, value);
  } catch {}
};

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
// у блока статьи кнопок пять: «сохранить» во всю ширину и две строки по две
const SINGLE_ACTIONS_HEIGHT = 26 * 3 + 4 * 2 + 2;
// «Авто»: без полосы действий и рамок ряда, промежуток абзаца — доля кегля (panels.scss), строк от одной
const AUTO_GAP = 0.4;
const AUTO_MIN_ROWS = 1;
// строка не длиннее — заведомо меньше предела блока в байтах UTF-8 (до 3 байт на знак)
const SHORT_LINE = 5000;

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
const charsPerLine = (width, fontSize, single = false, auto = false) => {
  const textWidth = (width - (auto ? 0 : ACTIONS_COLUMN)) / (single ? 1 : 2) - TEXTAREA_PADDING_X;
  return Math.max(1, Math.floor(textWidth / (fontSize * CHAR_WIDTH)));
};
// Строк ячейки: по знакам плюс по строке на каждый перенос, не меньше minRows.
const linesOf = ({ chars, breaks }, perLine, min = MIN_ROWS) => Math.max(min, Math.ceil(chars / perLine) + breaks);

// Оценка высоты ряда редактора: строки большей ячейки по кеглю, отступы и рамка textarea, не ниже
// строк кнопок, плюс отступы и линия ряда. single — блок статьи: одна колонка во всю ширину;
// auto — статья в «Авто»: только ячейка и промежуток абзаца.
export const estimateEditorRowHeight = (row, box, fontSize = EDITOR_FONT_DEFAULT, single = false, auto = false) => {
  const perLine = charsPerLine(box.width, fontSize, single, auto);
  const { left, right } = row ? rowMetrics(row) : { left: EMPTY_CELL, right: EMPTY_CELL };
  if (auto) {
    return Math.ceil(linesOf(left, perLine, AUTO_MIN_ROWS) * fontSize * LINE_HEIGHT) + TEXTAREA_EXTRA_Y + Math.round(fontSize * AUTO_GAP);
  }
  const lines = single ? linesOf(left, perLine) : Math.max(linesOf(left, perLine), linesOf(right, perLine));
  const cell = Math.ceil(lines * fontSize * LINE_HEIGHT) + TEXTAREA_EXTRA_Y;
  return Math.max(cell, single ? SINGLE_ACTIONS_HEIGHT : ACTIONS_HEIGHT) + ROW_EXTRA;
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
const cellMetric = (el, minRows = MIN_ROWS) => {
  const style = getComputedStyle(el);
  const px = (name) => parseFloat(style[name]) || 0;
  const lineHeight = px('lineHeight') || px('fontSize') * LINE_HEIGHT;
  const padding = px('paddingTop') + px('paddingBottom');
  const frame = style.boxSizing === 'content-box' ? 0 : padding + px('borderTopWidth') + px('borderBottomWidth');
  return (scrollHeight) => {
    if (!scrollHeight) return 0;
    const lines = Math.max(minRows, Math.round((scrollHeight - padding) / lineHeight));
    return Math.round((lines * lineHeight + frame) * 100) / 100;
  };
};
// Пакет замеров: сброс высоты и чтение scrollHeight у всех — одна принудительная вёрстка на
// пакет, затем записи. Ячейка с нулевым scrollHeight не отрисована (скрыта) — ей высоту не писать.
const fitCells = (fit, measure, apply) => {
  for (const item of measure) item.el.style.height = '0px';
  if (!fit.metric) fit.metric = cellMetric(measure[0].el, fit.minRows);
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

// Строка курсора textarea — по зеркалу: скрытый div с тем же шрифтом, шириной и переносами, метка на
// месте курсора. { line, lines, top, lineHeight }: строка курсора, всего строк, верх строки от верха textarea.
const MIRROR_STYLES = [
  'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth',
  'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle', 'fontFamily', 'fontSize',
  'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textTransform', 'wordSpacing', 'tabSize',
  'textIndent', 'wordBreak',
];
const ZERO_WIDTH = '​';
const textareaCaret = (el, pos) => {
  const style = getComputedStyle(el);
  const mirror = document.createElement('div');
  for (const name of MIRROR_STYLES) mirror.style[name] = style[name];
  Object.assign(mirror.style, {
    position: 'absolute',
    visibility: 'hidden',
    top: '0',
    left: '-9999px',
    height: 'auto',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  });
  const marker = document.createElement('span');
  marker.textContent = ZERO_WIDTH;
  mirror.append(el.value.slice(0, pos), marker, `${el.value.slice(pos)}${ZERO_WIDTH}`);
  document.body.append(mirror);
  const px = (name) => parseFloat(style[name]) || 0;
  const lineHeight = px('lineHeight') || px('fontSize') * LINE_HEIGHT;
  const top = marker.offsetTop - px('paddingTop');
  const content = mirror.clientHeight - px('paddingTop') - px('paddingBottom');
  mirror.remove();
  return {
    line: Math.max(0, Math.round(top / lineHeight)),
    lines: Math.max(1, Math.round(content / lineHeight)),
    top: marker.offsetTop + px('borderTopWidth'),
    lineHeight,
  };
};

// Курсор textarea в окне скроллера: фокус без прокрутки браузера, затем сдвиг scrollTop до строки курсора.
const revealTextareaCaret = (scroller, el, pos) => {
  if (!scroller) return;
  const { top, lineHeight } = textareaCaret(el, pos);
  const box = scroller.getBoundingClientRect();
  const caretTop = el.getBoundingClientRect().top + top;
  if (caretTop < box.top) scroller.scrollTop -= box.top - caretTop + lineHeight;
  else if (caretTop + lineHeight > box.bottom) scroller.scrollTop += caretTop + lineHeight - box.bottom + lineHeight;
};

// Смещение в исходнике по строке и знаку (у Visual строка Quill — строка исходника).
const offsetAt = (source, line, column) => {
  let start = 0;
  for (let i = 0; i < line; i += 1) {
    const next = source.indexOf('\n', start);
    if (next < 0) return source.length;
    start = next + 1;
  }
  const end = source.indexOf('\n', start);
  return start + Math.min(column, (end < 0 ? source.length : end) - start);
};

// Предпросмотр показывает то, что уйдёт в ход: без пустых рядов, языки обрезаны; id выделений —
// верхним индексом, как в предпросмотре статьи. Его корень —
// скроллер сетки: ряды вне окна она рисует заглушками. Сетка монтируется после того, как корень
// попал в ref: иначе её хук увидел бы пустой ref и отрисовал все ряды разом.
const Preview = ({ rows, languages, single }) => {
  const t = useTranslations('Game.translation');
  const markVars = useMdMarkVars();
  const ready = !!useMdRenderer();
  const pane = useRef(null);
  const [mounted, setMounted] = useState(false);
  useTranslationWheel(pane);
  const bindPane = useCallback((el) => {
    if (!el) return;
    pane.current = el;
    setMounted(true);
  }, []);
  const shown = dropEmptyRows(rows);
  return (
    <div
      className={`md-editor__preview translation-preview${single ? ' translation-preview--single' : ''}`}
      ref={bindPane}
      data-test-id={TID.translation.editor.previewPane}
      style={markVars}
    >
      {!shown.length ? (
        <div className="md-editor__placeholder">Nothing to preview yet</div>
      ) : ready && mounted ? (
        <TranslationGrid
          rows={shown}
          languages={normalizeLanguages(languages)}
          scrollRef={pane}
          markIds
          showQuoteIds
          single={single}
        />
      ) : (
        <div className="md-editor__placeholder" data-test-id={TID.translation.loading}>
          {t('loading')}
        </div>
      )}
    </div>
  );
};

// Кнопки обёртки для ячейки, где был курсор. mousedown гасится на всей полосе: ячейка не теряет
// фокус и выделение.
const CellTools = memo(({ enabled, onWrap }) => {
  const t = useTranslations('Game.turnForm.translation.tools');
  const editor = TID.translation.editor;
  return (
    <div
      className="translation-editor__tools"
      data-test-id={editor.tools}
      onMouseDown={(e) => e.preventDefault()}
    >
      {WRAPS.map((item) => (
        <button
          key={item.name}
          type="button"
          className="md-editor__tool"
          title={t(enabled ? item.name : 'noCell')}
          disabled={!enabled}
          data-test-id={editor.tool(item.name)}
          onClick={() => onWrap(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});

// Ряд — memo с устойчивыми пропсами: набор текста в ячейке перерисовывает только свой ряд.
// live — ряды ходят на сервер по одному; last — единственный сохранённый ряд с текстом;
// rows у textarea — оценка до замера, после замера высота стоит инлайном.
// single — блок статьи: одна ячейка, кнопки «склеить со следующим» (hasNext — есть следующий блок)
// и «разделить по курсору» (caretHere — курсор был в этом блоке). auto — «Авто»: без кнопок блока,
// клавиши края блока и Enter — у редактора.
const EditorRow = memo(({ row, saved, live, busy, last, actions, titles, measureRef, cellRefs, perLine, visual, toolbarHost, toolbarActiveSide, single, hasNext, caretHere, auto }) => {
  const editor = TID.translation.editor;
  const sides = single ? SINGLE_SIDES : SIDES;
  const dirty = rowState(saved, row);
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
      {sides.map((side) => {
        const props = {
          'data-side': side,
          'data-dirty': dirty[side] ? 'true' : undefined,
          value: row[side],
          placeholder: single ? titles.placeholder : CELL_PLACEHOLDER[side],
          onFocus: () => actions.caret(row.id, side),
          // kind — вид правки от ячейки Visual (у textarea его знает обработчик клавиш)
          onChange: (e) => actions.cell(row.id, side, e.target.value, e.kind),
        };
        return visual ? (
          <TranslationVisualCell {...props} key={side} data-test-id={editor.visualCell}
            cellRef={cellRefs[side]} toolbarHost={toolbarHost} toolbarActive={toolbarActiveSide === side}
            auto={auto} onAutoKey={actions.autoKey} rowId={row.id} />
        ) : (
          <Input.TextArea {...props} key={side} data-test-id={editor.cell} ref={cellRefs[side]}
            className="translation-editor__cell" rows={linesOf(rowMetrics(row)[side], perLine, auto ? AUTO_MIN_ROWS : MIN_ROWS)}
            onKeyDown={auto ? (e) => actions.key(row.id, side, e) : undefined} />
        );
      })}
      {!auto && <div className="translation-editor__actions">
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
          title={single ? titles.addBelow : 'Add a row below'}
          data-test-id={editor.addRowAfter}
          data-row-id={row.id}
          onClick={() => actions.addAfter(row.id)}
        >
          <PlusOutlined />
        </button>
        <button
          type="button"
          className="md-editor__tool"
          title={keep ? titles.last : single ? titles.delete : 'Delete the row'}
          disabled={busy || keep}
          data-test-id={editor.deleteRow}
          data-row-id={row.id}
          data-last-row={keep ? 'true' : undefined}
          onClick={() => actions.remove(row.id)}
        >
          <DeleteOutlined />
        </button>
        {single && (
          <>
            <button
              type="button"
              className="md-editor__tool"
              title={hasNext ? titles.merge : titles.mergeLast}
              disabled={busy || !hasNext}
              data-test-id={editor.mergeRow}
              data-row-id={row.id}
              onClick={() => actions.merge(row.id)}
            >
              <VerticalAlignMiddleOutlined />
            </button>
            {/* mousedown гасится: курсор и выделение остаются в ячейке блока */}
            <button
              type="button"
              className="md-editor__tool"
              title={caretHere ? titles.split : titles.splitNoCursor}
              disabled={busy || !caretHere}
              data-test-id={editor.splitRow}
              data-row-id={row.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => actions.split(row.id)}
            >
              <ScissorOutlined />
            </button>
          </>
        )}
      </div>}
    </div>
  );
});

// aside — подпись поля из формы; saveTurnOps — действие записи операций (форма передаёт его
// сама: импорт отсюда замкнул бы settings → редактор → сокет → действия ходов → settings);
// lines — линии игры, dropQuoteLinks({ lineIds, quoteKeys }) — снять линии и рамки ушедших цитат
// и сообщить спутникам: зовётся после записи ряда.
const TranslationEditor = ({
  changeHandler,
  prefixClass,
  value,
  form,
  patchForm,
  edition,
  setError,
  saveTurnOps,
  lines,
  dropQuoteLinks,
  aside = null,
  single = false,
  notifySplit,
  notifyMergeRefused,
}) => {
  const t = useTranslations('Game.turnForm');
  const dispatch = useDispatch();
  const turnId = useSelector((state) => state.panels.editTurnId);
  // Ряды ходят на сервер по одному, только когда ход сохранён тем же типом; статья — ещё и рядами:
  // у статьи без рядов на сервере нет блоков, к которым относились бы операции одного блока.
  const live = useSelector((state) => {
    const stored = state.turns.d[state.panels.editTurnId];
    if (!single) return stored?.contentType === 'translation';
    return stored?.contentType === 'md' && !!stored.dWidgets?.md_1?.rows?.length;
  });
  // markdown-it для деления блоков; до загрузки делить нечем (null)
  const markdownIt = useMdRenderer()?.markdownIt || null;
  // режим у статьи и у перевода — свой: тип хода в форме можно сменить, редактор остаётся тем же
  const [articleMode, setArticleMode] = useState(storedArticleMode);
  const [translationMode, setTranslationMode] = useState('visual');
  const mode = single ? articleMode : translationMode;
  const preview = mode === 'preview';
  const visual = mode.endsWith('visual');
  const auto = single && mode.startsWith('auto-');
  const [toolbarHost, setToolbarHost] = useState(null);
  const [toolbarCell, setToolbarCell] = useState(null);
  // окно удаления ряда с текстом; saved — ряд удалится на сервере сразу
  const [confirm, setConfirm] = useState(NO_CONFIRM);
  // окно потери линий: { summary, proceed } — proceed зовётся по «Удалить и сохранить»
  const [lostLinks, setLostLinks] = useState(null);
  // id рядов, чей запрос в пути
  const [pending, setPending] = useState({});
  // ряд с фокусом и только что добавленный ряд рисуются независимо от окна прокрутки
  const [focused, setFocused] = useState(null);
  const added = useRef(null);
  // Последняя ячейка с фокусом — цель кнопок обёртки в Source.
  const [caretCell, setCaretCell] = useState(null);
  const caretRow = caretCell === null ? null : cellRowId(caretCell);
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

  // Статья без рядов: исходник делится на блоки, как только загружен markdown-it. База остаётся
  // пустой — на сервере рядов нет, после первой правки все блоки уйдут вставками общим Save;
  // нетронутые блоки сравниваются с делением (rowsSplit) и правкой не считаются.
  const legacySource = single && !(value || []).length ? form?.markdown : null;
  useEffect(() => {
    if (!legacySource?.trim() || !markdownIt) return;
    const blocks = rowsFromMarkdown(legacySource, markdownIt);
    patchForm((prev) =>
      prev.rows?.length
        ? {}
        : { rows: blocks, rowsSplit: blocks, ...(prev.rowsBase ? {} : { rowsBase: [] }) },
    );
  }, [legacySource, markdownIt]);

  const now = useRef(null);
  now.current = {
    rows,
    caretCell,
    base,
    live,
    turnId,
    changeHandler,
    patchForm,
    edition,
    setError,
    saveTurnOps,
    lastTitle,
    lines,
    dropQuoteLinks,
    single,
    markdownIt,
    notifySplit,
    notifyMergeRefused,
    auto,
    visual,
  };

  // Скроллер рядов. Ref-колбэк пропускает null (тело снято на время Preview — хук держит прежний
  // элемент, а не считает окно бесконечным) и перерисовывает редактор, когда тело смонтировано
  // заново: хук подключается к новому элементу.
  const body = useRef(null);
  useTranslationWheel(body);
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
      visual: new Map(),
      seen: new WeakSet(),
      known: new Map(),
      refs: new Map(),
      queue: new Set(),
      all: false,
      metric: null,
      width: 0,
      auto: false,
      minRows: MIN_ROWS,
    };
  }
  const f = fit.current;
  // «Авто» ↔ «Блоки» в Source: те же textarea, другая высота строки минимума — перемерить все
  if (f.auto !== auto) {
    f.auto = auto;
    f.minRows = auto ? AUTO_MIN_ROWS : MIN_ROWS;
    refitAll(f, true);
  }
  // Куда поставить курсор после деления, склейки и стрелок: { id, at: 'start' | 'end' } или
  // { id, md, quill, line, column } — смещение в исходнике (textarea), в Quill или строка и знак.
  // Ставится, когда ячейка ряда смонтирована и показывает текст ряда.
  const want = useRef(null);
  const applyWant = useCallback(() => {
    const target = want.current;
    if (!target) return;
    const row = now.current.rows.find((item) => item.id === target.id);
    if (!row) {
      want.current = null;
      return;
    }
    const key = cellKey(target.id, 'left');
    const source = text(row.left);
    const handle = f.visual.get(key);
    if (handle?.quill) {
      if (handle.synced() !== source) return;
      want.current = null;
      const { quill } = handle;
      const end = Math.max(0, quill.getLength() - 1);
      let index = end;
      if (target.at === 'start') index = 0;
      else if (target.at !== 'end') index = target.quill ?? handle.lineIndex(target.line, target.column);
      quill.focus();
      quill.setSelection(Math.min(index, end), 0, 'api');
      return;
    }
    const el = f.cells.get(key);
    if (!el || el.value !== source) return;
    want.current = null;
    const pos = target.at === 'start' ? 0 : target.at === 'end' ? source.length : Math.min(target.md, source.length);
    el.focus({ preventScroll: true });
    el.setSelectionRange(pos, pos);
    revealTextareaCaret(body.current, el, pos);
  }, []);
  const cellRefs = useCallback((id) => {
    let refs = f.refs.get(id);
    if (!refs) {
      const bind = (side) => (handle) => {
        const key = cellKey(id, side);
        if (handle?.quill) {
          f.visual.set(key, handle);
          setToolbarCell((current) => current || key);
          applyWant();
          return () => {
            if (f.visual.get(key) !== handle) return;
            f.visual.delete(key);
            setToolbarCell((current) => current === key ? f.visual.keys().next().value || null : current);
          };
        }
        const el = textareaOf(handle);
        if (!el) {
          f.cells.delete(key);
          f.visual.delete(key);
          return;
        }
        f.visual.delete(key);
        f.cells.set(key, el);
        if (f.seen.has(el)) return;
        f.seen.add(el);
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
    (id, box) =>
      estimateEditorRowHeight(now.current.rows[indexById.get(id)], box, fontSize.current, single, auto),
    [indexById, fontChanges, visual, single, auto],
  );
  const always = useMemo(
    // Один активный ряд остаётся смонтированным вместе со своим нативным тулбаром.
    () => [focused, visual && toolbarCell ? cellRowId(toolbarCell) : null, added.current, ...Object.keys(pending)].filter(Boolean),
    [focused, pending, ids, visual, toolbarCell],
  );
  // смена Visual / Source, «Авто» / «Блоки» и числа колонок (статья ↔ перевод в той же форме) — другие высоты
  const layoutKey = single ? `${visual}|${auto}|single` : visual;
  const { visible, heightOf, measureRef, box, scrollToPart } = useVisibleParts({ scrollRef: body, ids, estimate, always, layoutKey });
  now.current.scrollToPart = scrollToPart;

  // Форма открыта с карточки, прокрученной не в начало: ряд из середины карточки — в середину тела,
  // как только он есть среди рядов формы (их заливают после монтажа). Курсор не ставится.
  const middle = useRef(null);
  useLayoutEffect(() => {
    middle.current = { id: takeMiddleRow(turnId), until: Date.now() + 3000 };
  }, [turnId]);
  useLayoutEffect(() => {
    const want = middle.current;
    if (!want?.id || preview || !body.current) return;
    const { id } = want;
    if (!indexById.has(id)) {
      if (Date.now() > want.until) want.id = null;
      return;
    }
    want.id = null;
    centrePart(body.current, (part) => now.current.scrollToPart(part), id);
  }, [indexById, preview]);
  const width = box ? box.width : 0;
  const perLine = charsPerLine(width, fontSize.current, single, auto);

  // Ряды сняты — их ячейки забыть.
  useLayoutEffect(() => {
    for (const id of f.refs.keys()) if (!indexById.has(id)) f.refs.delete(id);
    for (const key of f.known.keys()) if (!indexById.has(cellRowId(key))) f.known.delete(key);
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

  // Курсор после деления и склейки: textarea — после замера высот этого коммита, Quill — после того,
  // как ячейка в своём эффекте приняла новый текст (эффекты детей идут раньше).
  useLayoutEffect(() => applyWant());
  useEffect(() => applyWant());

  // Обработчики одни на всё время жизни редактора и читают текущее из now.
  const actions = useMemo(() => {
    // Ход нельзя оставить без рядов с текстом — и двумя удалениями подряд, пока первое в пути.
    const blocked = (id) => {
      const { base, setError, lastTitle } = now.current;
      if (!leavesNoText(base, [...removing.current, id])) return false;
      setError({ message: lastTitle });
      return true;
    };
    // Цитаты, которые уйдут из сохранённого хода с операциями ряда: { quoteKeys, lineIds, summary }
    // или null. Сравнивается сохранённое до и после: цитата, перенесённая в ещё не сохранённый
    // ряд, считается ушедшей.
    const goneWith = (ops) => {
      const { base, turnId, lines } = now.current;
      if (ops[0].op === 'row.insert') return null;
      const links = quoteLinks(turnId, lostRowQuotes(base, advanceBase(base, ops)), lines);
      return links.quoteKeys.length ? links : null;
    };
    // Операции ряда — одним запросом; после ответа двигается база, форма остаётся открытой.
    // lost — ряд, уже снятый из формы: при отказе он возвращается на место.
    const send = (id, ops, lost) => {
      const { turnId, edition, saveTurnOps } = now.current;
      const token = edition.token();
      const removes = ops[0].op === 'row.remove';
      if (removes && blocked(id)) return false;
      if (removes) removing.current.add(id);
      const gone = now.current.dropQuoteLinks ? goneWith(ops) : null;
      setPending((prev) => ({ ...prev, [id]: true }));
      // с ушедшими цитатами спутникам сообщает dropQuoteLinks — после удаления линий
      dispatch(saveTurnOps(gone ? { turnId, ops, cast: false } : { turnId, ops })).then((result) => {
        removing.current.delete(id);
        setPending(({ [id]: done, ...rest }) => rest);
        // ряд записан — линии снимаются и у закрытой формы
        if (gone && !result.error) now.current.dropQuoteLinks(gone);
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
    // Ряды пишутся и в now сразу: две правки одной ячейки до перерисовки (Quill шлёт вставку и
    // формат строки по отдельности) и проверка «Авто» после них видят последний текст.
    const commit = (next) => {
      now.current.rows = next;
      now.current.changeHandler(next);
    };
    const cell = (id, side, value, kind) => {
      const { rows } = now.current;
      f.queue.add(cellKey(id, side));
      commit(rows.map((row) => (row.id === id ? { ...row, [side]: value } : row)));
      const typed = kinds.get(id);
      kinds.delete(id);
      if (now.current.auto && side === 'left') scheduleCheck(id, kind || typed || 'type');
    };

    // «Авто». Вид правки textarea — от обработчика клавиш до onChange; проверка деления — после
    // текущего события, раз на ряд: вид сильнее «type» не теряется.
    const kinds = new Map();
    const checks = new Map();
    const scheduleCheck = (id, kind) => {
      const had = checks.get(id);
      checks.set(id, had && kind === 'type' ? had : kind);
      if (had) return;
      Promise.resolve().then(() => {
        const queued = checks.get(id);
        checks.delete(id);
        check(id, queued);
      });
    };
    const check = (id, kind) => {
      const { rows, markdownIt, auto } = now.current;
      if (!auto || !markdownIt) return;
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) return;
      const source = text(rows[index].left);
      // одна короткая строка набором не делится: без чтения курсора
      if ((kind === 'type' || kind === 'format') && !source.includes('\n') && source.length <= SHORT_LINE) return;
      const key = cellKey(id, 'left');
      const handle = f.visual.get(key);
      let caret = source.length;
      let column = null;
      let effective = kind === 'format' ? 'type' : kind;
      if (handle?.quill) {
        const info = handle.caretInfo();
        if (info) {
          caret = offsetAt(source, info.line, info.column);
          column = info.column;
          if ((kind === 'enter' || kind === 'format') && info.leave) effective = 'leave';
        }
      } else {
        const el = f.cells.get(key);
        if (el && typeof el.selectionEnd === 'number') caret = el.selectionEnd;
      }
      const split = autoSplit(source, caret, { markdownIt, kind: effective });
      if (split) applySplit(index, split, handle?.quill ? column : null);
    };
    // Первая часть (keep) остаётся рядом с id блока, остальные — новые ряды; ряд с курсором
    // смонтирован как только что добавленный.
    const applySplit = (index, split, quillColumn) => {
      const { rows } = now.current;
      const row = rows[index];
      const pieces = split.parts.map((left, k) =>
        k === split.keep ? { ...row, left } : { id: newRowId(), left, right: '' },
      );
      const next = [...rows];
      next.splice(index, 1, ...pieces);
      const target = pieces[split.part].id;
      if (target !== row.id) added.current = target;
      f.queue.add(cellKey(row.id, 'left'));
      const atEnd = split.moved && split.caret > 0 && split.caret === split.parts[split.part].length;
      want.current = atEnd
        ? { id: target, at: 'end' }
        : {
            id: target,
            md: split.caret,
            line: split.line,
            column: quillColumn !== null && !split.moved ? quillColumn : split.column,
          };
      commit(next);
    };
    // Длина текста блока в Quill — место стыка при склейке в Visual.
    const quillLength = (source) => {
      const bridge = f.visual.values().next().value?.bridge;
      if (!bridge) return null;
      let length = 0;
      for (const op of bridge.toDelta(source).ops) length += typeof op.insert === 'string' ? op.insert.length : 1;
      return Math.max(0, length - 1);
    };
    // Склейка с соседом: dir 'up' — с предыдущим (Backspace в начале), 'down' — со следующим (Delete
    // в конце). true — клавиша обработана (и при отказе по пределу — тогда уведомление).
    const join = (id, dir) => {
      const { rows, visual } = now.current;
      const index = rows.findIndex((row) => row.id === id);
      const top = dir === 'up' ? index - 1 : index;
      if (index < 0 || top < 0 || top + 1 >= rows.length) return false;
      const upper = rows[top];
      const lower = rows[top + 1];
      const merged = autoMerge(upper.left, lower.left);
      if (!merged) {
        now.current.notifyMergeRefused?.();
        return true;
      }
      const kept = merged.keep === 'upper' ? upper : lower;
      const gone = merged.keep === 'upper' ? lower : upper;
      const next = rows
        .filter((row) => row.id !== gone.id)
        .map((row) => (row.id === kept.id && row.left !== merged.text ? { ...row, left: merged.text } : row));
      if (!merged.caret) want.current = { id: kept.id, at: 'start' };
      else if (!visual) want.current = { id: kept.id, md: merged.caret };
      else {
        const joint = quillLength(upper.left);
        want.current = joint === null ? { id: kept.id, at: 'end' } : { id: kept.id, quill: joint, md: merged.caret };
      }
      if (!f.visual.has(cellKey(kept.id, 'left')) && !f.cells.has(cellKey(kept.id, 'left'))) added.current = kept.id;
      f.queue.add(cellKey(kept.id, 'left'));
      commit(next);
      return true;
    };
    // Стрелка с первой / последней строки блока — в конец предыдущего / начало следующего; ряд вне
    // окна сначала подводится прокруткой, как переход к найденному.
    const move = (id, dir) => {
      const { rows } = now.current;
      const index = rows.findIndex((row) => row.id === id);
      const target = index < 0 ? null : rows[index + (dir === 'up' ? -1 : 1)];
      if (!target) return false;
      want.current = { id: target.id, at: dir === 'up' ? 'end' : 'start' };
      const key = cellKey(target.id, 'left');
      if (f.visual.has(key) || f.cells.has(key)) applyWant();
      else now.current.scrollToPart?.(target.id).then(() => applyWant());
      return true;
    };
    // Клавиши textarea в «Авто»: Enter (пункт списка — новый пункт или выход из списка), склейка на
    // краю, стрелки на первой / последней видимой строке. Правки — через execCommand: остаётся отмена.
    const key = (id, side, e) => {
      if (!now.current.auto || side !== 'left') return;
      if (e.nativeEvent?.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target;
      const { selectionStart: start, selectionEnd: end, value } = el;
      if (e.key === 'Enter') {
        if (e.shiftKey) return;
        const item = listEnter(value, start, end);
        if (!item) {
          kinds.set(id, 'enter');
          return;
        }
        e.preventDefault();
        kinds.set(id, item.kind === 'leave' ? 'leave' : 'type');
        el.setSelectionRange(item.from, item.to);
        const done = item.insert
          ? document.execCommand('insertText', false, item.insert)
          : document.execCommand('delete');
        if (!done) {
          want.current = { id, md: item.caret };
          cell(id, side, item.text);
        }
        return;
      }
      if (e.shiftKey || start !== end) return;
      if (e.key === 'Backspace' && start === 0) {
        if (join(id, 'up')) e.preventDefault();
      } else if (e.key === 'Delete' && start === value.length) {
        if (join(id, 'down')) e.preventDefault();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const up = e.key === 'ArrowUp';
        const { line, lines } = textareaCaret(el, start);
        if ((up ? line === 0 : line >= lines - 1) && move(id, up ? 'up' : 'down')) e.preventDefault();
      }
    };
    // Клавиши края блока из Quill (привязки ячейки): true — обработано.
    const autoKey = (id, name) => {
      if (!now.current.auto) return false;
      if (name === 'mergeUp') return join(id, 'up');
      if (name === 'mergeDown') return join(id, 'down');
      if (name === 'up' || name === 'down') return move(id, name);
      return false;
    };
    // Дописанные id меняют значение ячейки программно: выделение в ней возвращается на тот же текст.
    const keepCarets = (id, before, after) => {
      const kept = [];
      for (const side of SIDES) {
        const el = f.cells.get(cellKey(id, side));
        if (!el || before[side] === after[side] || typeof el.selectionStart !== 'number') continue;
        kept.push([
          el,
          caretAfterIds(before, after, side, el.selectionStart),
          caretAfterIds(before, after, side, el.selectionEnd),
        ]);
      }
      if (!kept.length) return;
      requestAnimationFrame(() => {
        for (const [el, start, end] of kept) el.setSelectionRange(start, end);
      });
    };
    // Выделения ряда получают id до отправки; текст с id остаётся и в форме. Уходят цитаты с
    // линиями (в том числе с рядом, сохранённым пустым) — сначала окно потери линий, форма не тронута.
    // Блок статьи, в котором оказалось несколько блоков, уходит рядами: первая часть — этот ряд,
    // остальные вставляются за ним тем же запросом.
    const splitOnSave = (rows, id) => {
      const { single, base, markdownIt } = now.current;
      if (!single) return { rows, extra: [], parts: 0 };
      const split = splitDraftRows(rows, base, markdownIt, { only: id });
      if (!split.parts) return { rows, extra: [], parts: 0 };
      const index = split.rows.findIndex((row) => row.id === id);
      const added = split.rows.slice(index + 1, index + split.parts);
      let after = id;
      const extra = added.map((row) => {
        const op = { op: 'row.insert', after, row: { id: row.id, left: row.left, right: '' } };
        after = row.id;
        return op;
      });
      return { rows: split.rows, extra, parts: split.parts };
    };
    const save = (id, confirmed) => {
      const { base, live, changeHandler, notifySplit } = now.current;
      if (!live) return;
      const before = now.current.rows;
      const withIds = ensureRowQuoteIds(before, base, { only: id });
      const { rows, extra, parts } = splitOnSave(withIds, id);
      const own = rowOps(base, rows, id);
      const ops = [...own, ...extra];
      if (!own.length) return;
      const summary = confirmed ? null : goneWith(ops)?.summary;
      if (summary) {
        setLostLinks({ summary, proceed: () => save(id, true) });
        return;
      }
      if (rows !== before) {
        const index = rows.findIndex((row) => row.id === id);
        for (const side of SIDES) f.queue.add(cellKey(id, side));
        if (!parts) keepCarets(id, before[index], rows[index]);
        changeHandler(rows);
      }
      if (parts) notifySplit?.(parts);
      send(id, ops);
    };
    // Склеить блок со следующим (через пустую строку) и разделить по курсору. Сохранённая статья
    // получает такую правку сразу, как удаление: иначе общий Save или Cancel после сохранения
    // одного из двух блоков оставили бы текст на сервере дважды или потеряли бы его часть.
    const structural = (id, rows, ops) => {
      const { live, changeHandler } = now.current;
      if (live && ops.length) {
        const summary = goneWith(ops)?.summary;
        if (summary) {
          setLostLinks({ summary, proceed: () => {
            if (send(id, ops)) changeHandler(rows);
          } });
          return;
        }
        if (!send(id, ops)) return;
      }
      changeHandler(rows);
    };
    const merge = (id) => {
      const { rows, base } = now.current;
      const index = rows.findIndex((row) => row.id === id);
      const next = rows[index + 1];
      if (index < 0 || !next) return;
      const left = [text(rows[index].left).replace(/\n+$/, ''), text(next.left).replace(/^\n+/, '')]
        .filter((part) => part.trim() !== '')
        .join('\n\n');
      const merged = rows.filter((row) => row.id !== next.id);
      merged[index] = { ...rows[index], left };
      const withIds = ensureRowQuoteIds(merged, base, { only: id });
      for (const side of SIDES) f.queue.add(cellKey(id, side));
      const own = rowOps(base, withIds, id);
      const ops = [...own, ...(savedRow(base, next.id) ? [{ op: 'row.remove', id: next.id }] : [])];
      // ни один из двух не сохранён — правка только в форме
      const onServer = savedRow(base, id) || savedRow(base, next.id);
      structural(own.length ? id : next.id, withIds, onServer ? ops : []);
    };
    // Курсор: у textarea — selectionStart, у Visual — индекс выделения Quill; части дельты по обе
    // стороны курсора переводятся обратно в исходник мостом (строка курсора остаётся с форматом).
    const caretSplit = (id) => {
      const key = cellKey(id, 'left');
      const row = now.current.rows.find((item) => item.id === id);
      const handle = f.visual.get(key);
      if (handle?.quill && handle.bridge) {
        const range = handle.quill.getSelection();
        if (!range) return null;
        const contents = handle.quill.getContents();
        const tail = contents.slice(range.index + range.length);
        const lineEnd = tail.ops.find((op) => typeof op.insert === 'string' && op.insert.includes('\n'));
        const head = [...contents.slice(0, range.index).ops, { insert: '\n', ...(lineEnd?.attributes ? { attributes: lineEnd.attributes } : {}) }];
        return [handle.bridge.toMarkdown(head), handle.bridge.toMarkdown(tail.ops)];
      }
      const el = f.cells.get(key);
      if (!el || typeof el.selectionStart !== 'number') return null;
      const source = text(row?.left);
      return [source.slice(0, el.selectionStart), source.slice(el.selectionEnd)];
    };
    const split = (id) => {
      const { rows, base } = now.current;
      const parts = caretSplit(id);
      if (!parts) return;
      // пустые строки на стыке уходят; отступ первой строки второй части остаётся (код с отступом)
      const head = parts[0].replace(/\s+$/, '');
      const tail = parts[1].replace(/^([ \t]*\n)+/, '').replace(/\s+$/, '');
      if (!head.trim() || !tail.trim()) return;
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) return;
      const fresh = { id: newRowId(), left: tail, right: '' };
      let next = [...rows];
      next.splice(index, 1, { ...rows[index], left: head }, fresh);
      next = ensureRowQuoteIds(next, base, { only: id });
      next = ensureRowQuoteIds(next, base, { only: fresh.id });
      for (const side of SIDES) f.queue.add(cellKey(id, side));
      added.current = fresh.id;
      const ops = savedRow(base, id)
        ? [...rowOps(base, next, id), { op: 'row.insert', after: id, row: next[index + 1] }]
        : [];
      structural(id, next, ops);
    };
    return {
      drop,
      cell,
      merge,
      split,
      key,
      autoKey,
      caret: (id, side) => {
        const key = cellKey(id, side);
        setCaretCell(key);
        if (f.visual.has(key)) setToolbarCell(key);
      },
      wrap: (item) => {
        const key = now.current.caretCell;
        const el = f.cells.get(key);
        if (!el) return;
        const next = wrapSelection(el.value, el.selectionStart, el.selectionEnd, item);
        cell(cellRowId(key), cellSide(key), next.text);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(next.start, next.end);
        });
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
      save,
      // ряд с цитатами, к которым идут линии, — через окно потери линий; иначе ряд с текстом
      // (в форме или сохранённым) — через окно удаления, пустой — сразу
      remove: (id) => {
        const { rows, base, live } = now.current;
        const saved = live ? savedRow(base, id) : undefined;
        const row = rows.find((item) => item.id === id);
        const summary = saved ? goneWith([{ op: 'row.remove', id }])?.summary : null;
        if (summary) {
          setLostLinks({ summary, proceed: () => drop(id) });
        } else if (rowHasText(row) || rowHasText(saved)) {
          setConfirm({ open: true, id, saved: !!saved });
        } else drop(id);
      },
      focus: (id) => {
        if (added.current !== id) added.current = null;
        setFocused(id);
      },
      blur: (id) => setFocused((current) => (current === id ? null : current)),
    };
  }, [dispatch]);

  const saveTitle = t('translation.saveRow');
  const detachedTitle = t(single ? 'blocks.saveOff' : 'translation.saveRowOff');
  // подписи кнопок блока — строками в зависимостях: titles остаётся тем же объектом между рендерами
  const blockTitles = [
    t('blocks.placeholder'),
    t('blocks.addBelow'),
    t('blocks.delete'),
    t('blocks.merge'),
    t('blocks.mergeLast'),
    t('blocks.splitAtCursor'),
    t('blocks.splitNoCursor'),
  ];
  const titles = useMemo(() => {
    const [placeholder, addBelow, remove, merge, mergeLast, split, splitNoCursor] = blockTitles;
    return {
      save: saveTitle,
      detached: detachedTitle,
      last: lastTitle,
      placeholder,
      addBelow,
      delete: remove,
      merge,
      mergeLast,
      split,
      splitNoCursor,
    };
  }, [saveTitle, detachedTitle, lastTitle, ...blockTitles]);

  const tMode = useTranslations('Game.turnForm.editorMode');
  const modeOptions = (single ? ARTICLE_MODES : TRANSLATION_MODES).map((value) => ({
    value,
    label: tMode(MODE_LABELS[value]),
  }));
  // смена Visual / Source и уход в Preview снимают цель кнопок обёртки и нативный тулбар
  const changeMode = (next) => {
    if (next === 'preview' || preview || next.endsWith('visual') !== visual) {
      setCaretCell(null);
      setToolbarCell(null);
    }
    if (!single) return setTranslationMode(next);
    setArticleMode(next);
    if (next !== 'preview') storeArticleMode(next);
  };

  // «Скопировать всю статью»: склейка блоков через пустую строку — исходник статьи целиком.
  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    const source = joinBlocks(dropEmptyRows(now.current.rows));
    Promise.resolve(navigator.clipboard?.writeText(source)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, () => {});
  };

  const setLanguage = (side, text) =>
    patchForm((prev) => ({
      ...prev,
      languages: { ...(prev.languages || {}), [side]: text },
    }));
  const onlyText = live ? onlyTextRowId(base) : null;
  // состояние блока на экране: у статьи без рядов нетронутый блок — как сохранённый
  const shownBase = draftBase(form) || base;
  const canWrap = caretRow !== null && indexById.has(caretRow) && visible.has(caretRow);
  const toolbarDisabled = caretCell !== null && !f.visual.has(caretCell);

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
    const index = indexById.get(id);
    const row = rows[index];
    parts.push(
      <EditorRow
        key={id}
        row={row}
        saved={savedRow(shownBase, id)}
        live={live}
        busy={!!pending[id]}
        last={onlyText === id}
        actions={actions}
        titles={titles}
        measureRef={measureRef(id)}
        cellRefs={cellRefs(id)}
        perLine={perLine}
        visual={visual}
        toolbarHost={toolbarHost}
        toolbarActiveSide={toolbarCell && cellRowId(toolbarCell) === id ? cellSide(toolbarCell) : null}
        single={single}
        hasNext={single && index + 1 < ids.length}
        caretHere={single && caretRow === id}
        auto={auto}
      />,
    );
  }
  flushHidden();

  return (
    <div
      className={`md-editor translation-editor${single ? ' translation-editor--single' : ''}${auto ? ' translation-editor--auto' : ''}`}
      data-test-id={TID.addTurn.field(prefixClass)}
      data-single={single ? 'true' : undefined}
    >
      <div className="md-editor__bar translation-editor__bar">
        {!preview && (visual ? (
          <div
            className="translation-editor__visual-tools"
            data-test-id={editor.tools}
            data-disabled={toolbarDisabled || undefined}
            inert={toolbarDisabled}
            ref={setToolbarHost}
            onMouseDown={(e) => e.preventDefault()}
          />
        ) : <CellTools enabled={canWrap} onWrap={actions.wrap} />)}
        {(!visual || preview) && <div className="flex-1" />}
        {aside}
        <Select
          className="translation-editor__mode"
          size="small"
          value={mode}
          options={modeOptions}
          onChange={changeMode}
          popupMatchSelectWidth={false}
          optionRender={(option) => (
            <span data-test-id={editor.modeOption(option.value)}>{option.label}</span>
          )}
          data-test-id={editor.mode}
          data-value={mode}
        />
        {single && (
          <button
            type="button"
            className="btn btn-primary md-editor__toggle"
            title={copied ? t('blocks.copied') : t('blocks.copyAll')}
            aria-label={t('blocks.copyAll')}
            data-test-id={editor.copyAll}
            data-copied={copied ? 'true' : undefined}
            onClick={copyAll}
          >
            {copied ? <CheckOutlined /> : <CopyOutlined />}
          </button>
        )}
        {!preview && !single && (
          <div className="translation-editor__languages" data-test-id={editor.languages}>
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
          </div>
        )}
      </div>
      {preview ? (
        <Preview rows={rows} languages={languages} single={single} />
      ) : (
        <div className="translation-editor__body" ref={bindBody}>
          {parts}
          <button
            type="button"
            className="btn btn-primary translation-editor__add"
            data-test-id={editor.addRow}
            onClick={actions.addAtEnd}
          >
            {single ? t('blocks.add') : '+ Row'}
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

      {/* то же окно, что у общего Save формы */}
      <Modal
        open={!!lostLinks}
        title={t('lostLinks.Title')}
        okText={t('lostLinks.Ok')}
        cancelText={t('lostLinks.Cancel')}
        okButtonProps={{ danger: true, 'data-test-id': TID.addTurn.lostLinksSave }}
        cancelButtonProps={{ 'data-test-id': TID.addTurn.lostLinksCancel }}
        onCancel={() => setLostLinks(null)}
        onOk={() => {
          const { proceed } = lostLinks;
          setLostLinks(null);
          proceed();
        }}
      >
        {!!lostLinks && (
          <div
            data-test-id={TID.addTurn.lostLinks}
            data-quotes={lostLinks.summary.quotesCount}
            data-links={lostLinks.summary.linesCount}
          >
            <p>{t('lostLinks.Text')}</p>
            <p className="mb-0">
              {t.rich('lostLinks.Count', {
                quotes: lostLinks.summary.quotesCount,
                links: lostLinks.summary.linesCount,
                b: (chunks) => <b>{chunks}</b>,
              })}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TranslationEditor;

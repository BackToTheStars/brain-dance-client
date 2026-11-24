import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Input } from 'antd';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/modules/ui/redux/actions';
import { loadBridge } from '../../forms/useMdBridge';
import EditorToolbarControls from '../../forms/EditorToolbarControls';
import { TID } from '@/config/testIds';

// Вставка в Quill квадратична по числу строк (замер: 50 КБ — 0,2 с, 200 КБ — 0,8 с, книга 3,6 МБ — 206–225 с),
// поэтому в Visual большой текст отклоняется; в Source вставка быстрая.
const PASTE_LIMIT_BYTES = 64 * 1024;

const BLOCK_FORMATS = ['header', 'list', 'blockquote', 'code-block'];
const blockFormat = (formats) => BLOCK_FORMATS.some((name) => formats[name] != null);
const NO_BLOCK_FORMAT = Object.fromEntries(BLOCK_FORMATS.map((name) => [name, null]));

// Вид правки для «Авто»: 'enter' — вставлен только перенос строки, 'format' — сменился лишь формат,
// иначе 'type'.
const changeKind = (delta) => {
  const inserts = delta.ops.filter((op) => op.insert !== undefined);
  if (inserts.length === 1 && inserts[0].insert === '\n') return 'enter';
  return !inserts.length && !delta.ops.some((op) => op.delete) ? 'format' : 'type';
};

// Quill только у видимых ячеек. Исходник остаётся в form.rows; открытие Visual
// без правки его не переписывает. Неподдерживаемая разметка правится в Source.
// auto — статья в «Авто»: Backspace / Delete на краю, ↑ / ↓ с первой / последней строки уходят
// редактору (onAutoKey(rowId, name) → true — обработано).
const TranslationVisualCell = ({ value, onChange, cellRef, toolbarHost, toolbarActive, auto = false, onAutoKey, rowId, ...props }) => {
  const t = useTranslations('Game.turnForm.editor');
  const tBlocks = useTranslations('Game.turnForm.blocks');
  const dispatch = useDispatch();
  const node = useRef(null);
  const toolbar = useRef(null);
  const editor = useRef(null);
  const now = useRef(null);
  now.current = { value, onChange, cellRef, dispatch, tBlocks, auto, onAutoKey, rowId };
  const [fallback, setFallback] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!toolbarHost) return;
    let alive = true;
    let dispose;
    Promise.all([
      loadBridge(),
      // Регистрирует атрибут id цитаты; импорт только в браузере.
      import('../../helpers/quillHelper'),
    ]).then(([bridge, { Quill, Delta, QUOTE_ID_ATTRIBUTE }]) => {
      if (!alive) return;
      const parsed = bridge.toDelta(now.current.value);
      if (parsed.unsupported.length) {
        setFallback(parsed.unsupported);
        return;
      }
      const quill = new Quill(node.current, {
        theme: 'snow',
        modules: {
          toolbar: { container: toolbar.current },
          history: { userOnly: true },
          clipboard: {
            // Вставленная копия получает собственный id при сохранении ряда.
            matchers: [[`[${QUOTE_ID_ATTRIBUTE}]`, (_node, delta) =>
              delta.compose(new Delta().retain(delta.length(), { id: null }))]],
          },
        },
        formats: ['bold', 'italic', 'strike', 'code', 'link', 'background', 'id', 'header', 'list', 'blockquote', 'code-block'],
        placeholder: props.placeholder?.replace(' (markdown)', ''),
      });
      quill.setContents(parsed.ops, 'api');
      // Фаза захвата на контейнере срабатывает раньше разбора буфера самим Quill.
      const guardPaste = (e) => {
        const data = e.clipboardData;
        const text = data?.getData('text/plain') || data?.getData('text/html') || '';
        if (text.length * 3 <= PASTE_LIMIT_BYTES) return;
        const bytes = new TextEncoder().encode(text).length;
        if (bytes <= PASTE_LIMIT_BYTES) return;
        e.preventDefault();
        e.stopPropagation();
        const size = Math.round(bytes / 1024);
        now.current.dispatch(addNotification({
          title: 'Info:',
          text: now.current.tBlocks('pasteRefused', { size }),
          testId: TID.md.pasteRefused,
          count: size,
        }));
      };
      const container = node.current;
      container.addEventListener('paste', guardPaste, true);
      const state = { quill, bridge, Delta, source: now.current.value };
      editor.current = state;
      const change = (delta, old, origin) => {
        if (origin !== 'user') return;
        state.source = bridge.toMarkdown(quill.getContents().ops);
        now.current.onChange({ target: { value: state.source }, kind: changeKind(delta) });
      };
      quill.on('text-change', change);
      // Привязки «Авто» — первыми в списке клавиши: Quill ставит свои раньше добавленных.
      const bind = (key, handler) => {
        quill.keyboard.addBinding({ key, handler });
        const list = quill.keyboard.bindings[key];
        list.unshift(list.pop());
      };
      const edge = (name) => now.current.auto && !!now.current.onAutoKey?.(now.current.rowId, name);
      // высота строки — по границам курсора: первая или последняя видимая строка блока
      const sameLine = (a, b) => a && b && Math.abs(a.top - b.top) < Math.max(1, Math.min(a.height, b.height) / 2);
      bind('Backspace', (range) => {
        if (!now.current.auto || range.length || range.index !== 0) return true;
        // у заголовка, пункта, цитаты, кода в начале — сначала снять формат строки, как в текстовых редакторах
        if (blockFormat(quill.getFormat(0))) {
          quill.formatLine(0, 1, NO_BLOCK_FORMAT, 'user');
          return false;
        }
        return !edge('mergeUp');
      });
      bind('Delete', (range) => {
        if (!now.current.auto || range.length || range.index < quill.getLength() - 1) return true;
        return !edge('mergeDown');
      });
      bind('ArrowUp', (range) => {
        if (!now.current.auto || range.length || !sameLine(quill.getBounds(range.index), quill.getBounds(0))) return true;
        return !edge('up');
      });
      bind('ArrowDown', (range) => {
        if (!now.current.auto || range.length) return true;
        if (!sameLine(quill.getBounds(range.index), quill.getBounds(Math.max(0, quill.getLength() - 1)))) return true;
        return !edge('down');
      });
      // мост нужен редактору для «разделить по курсору»: части дельты обратно в исходник; synced —
      // исходник, который показывает Quill; caretInfo — строка и знак курсора и признак «строка вышла
      // из списка, цитаты, кода или заголовка» (пустая последняя строка без формата после такой строки)
      const unregister = now.current.cellRef({
        quill,
        bridge,
        synced: () => state.source,
        caretInfo: () => {
          const range = quill.getSelection();
          if (!range) return null;
          const index = range.index + range.length;
          const before = quill.getText(0, index);
          const line = before.split('\n').length - 1;
          const column = index - (before.lastIndexOf('\n') + 1);
          const [blot] = quill.getLine(index);
          const lines = quill.getLines();
          const start = blot ? quill.getIndex(blot) : 0;
          const leave =
            !!blot &&
            lines[lines.length - 1] === blot &&
            blot.length() <= 1 &&
            start > 0 &&
            !blockFormat(quill.getFormat(start)) &&
            blockFormat(quill.getFormat(start - 1));
          return { line, column, leave };
        },
        lineIndex: (line, column) => {
          const lines = quill.getLines();
          const blot = lines[Math.min(line, lines.length - 1)];
          if (!blot) return 0;
          return quill.getIndex(blot) + Math.min(column, blot.length() - 1);
        },
      });
      setReady(true);
      dispose = () => {
        container.removeEventListener('paste', guardPaste, true);
        quill.off('text-change', change);
        quill.scroll.detach();
        unregister?.();
        editor.current = null;
        node.current?.replaceChildren();
      };
    }).catch(() => alive && setFallback(['load']));
    return () => {
      alive = false;
      dispose?.();
    };
  }, [toolbarHost]);

  useEffect(() => {
    const state = editor.current;
    if (!state || state.source === value) return;
    const parsed = state.bridge.toDelta(value);
    if (parsed.unsupported.length) {
      setFallback(parsed.unsupported);
      return;
    }
    // При выдаче id меняются только атрибуты. Точечная дельта сохраняет историю ввода.
    const change = state.quill.getContents().diff(new state.Delta(parsed.ops));
    state.quill.updateContents(change, 'api');
    state.quill.history.cutoff();
    state.source = value;
  }, [value]);

  if (fallback) return (
    <div className="translation-editor__fallback">
      <div className="md-editor__notice">{fallback[0] === 'load' ? t('visualLoadError') : `${t('unsupportedTitle')} ${fallback.map((reason) => t(`unsupported.${reason}`)).join(', ')}`}</div>
      <Input.TextArea {...props} className="translation-editor__cell" ref={cellRef} value={value} onChange={onChange} autoSize={{ minRows: 2 }} />
    </div>
  );
  return <>
    <div {...props} className="translation-editor__visual" data-ready={ready ? 'true' : 'false'}>
      {!ready && <span>{t('loading')}</span>}
      <div ref={node} />
    </div>
    {toolbarHost && createPortal(
      <div ref={toolbar} style={{ display: toolbarActive ? undefined : 'none' }}>
        <EditorToolbarControls testId={TID.translation.editor.tool} />
      </div>,
      toolbarHost,
    )}
  </>;
};

export default TranslationVisualCell;

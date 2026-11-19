import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Input } from 'antd';
import { useTranslations } from 'next-intl';
import { loadBridge } from '../../forms/useMdBridge';
import EditorToolbarControls from '../../forms/EditorToolbarControls';
import { TID } from '@/config/testIds';

// Quill только у видимых ячеек. Исходник остаётся в form.rows; открытие Visual
// без правки его не переписывает. Неподдерживаемая разметка правится в Source.
const TranslationVisualCell = ({ value, onChange, cellRef, toolbarHost, toolbarActive, ...props }) => {
  const t = useTranslations('Game.turnForm.editor');
  const node = useRef(null);
  const toolbar = useRef(null);
  const editor = useRef(null);
  const now = useRef(null);
  now.current = { value, onChange, cellRef };
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
      const state = { quill, bridge, Delta, source: now.current.value };
      editor.current = state;
      const change = (delta, old, origin) => {
        if (origin !== 'user') return;
        state.source = bridge.toMarkdown(quill.getContents().ops);
        now.current.onChange({ target: { value: state.source } });
      };
      quill.on('text-change', change);
      const unregister = now.current.cellRef({ quill });
      setReady(true);
      dispose = () => {
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

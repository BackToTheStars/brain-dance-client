// Редактор исходника md-статьи в форме хода: textarea с кнопками обёртки выделенного и
// переключатель на предпросмотр тем же рендером, что у карточки.

import { TID } from '@/config/testIds';
import { Input } from 'antd';
import { useRef, useState } from 'react';
import { markColorVars } from './markColors';
import { useMdHtml } from './mdRenderer';
import { WRAPS, wrapSelection } from './wrapTools';

const PLACEHOLDER =
  'Markdown: **bold**, *italic*, [link](https://…), # heading, - list, ==🟢 highlight== (🟡 🟢 🟣 🔵 ⚪ 🟠 🔴)';

// Форма показывает фоны палитры, как Quill абзаца; ^id — серым верхним индексом.
const PREVIEW_MARK_VARS = markColorVars({ palette: true });

const Preview = ({ source }) => {
  const { html } = useMdHtml(source, { showQuoteIds: true });
  return (
    <div
      className="md-editor__preview md-content"
      data-test-id={TID.md.previewPane}
      style={PREVIEW_MARK_VARS}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// aside — подпись поля и переключатель режима формы, notice — строка под панелью кнопок.
const MdEditor = ({ changeHandler, prefixClass, value, aside = null, notice = null }) => {
  const [preview, setPreview] = useState(false);
  const textAreaRef = useRef(null);
  const source = value || '';

  // Обёртка выделенного: курсор остаётся на том же тексте внутри обёртки.
  const wrap = (item) => {
    const el = textAreaRef.current?.resizableTextArea?.textArea;
    if (!el) return;
    const next = wrapSelection(source, el.selectionStart, el.selectionEnd, item);
    changeHandler(next.text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.start, next.end);
    });
  };

  return (
    <div className="md-editor">
      <div className="md-editor__bar">
        {!preview &&
          WRAPS.map((item) => (
            <button
              key={item.name}
              type="button"
              className="md-editor__tool"
              title={item.title}
              data-test-id={TID.md.toolbar(item.name)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrap(item)}
            >
              {item.label || ''}
            </button>
          ))}
        <div className="flex-1" />
        {aside}
        <button
          type="button"
          className="btn btn-primary md-editor__toggle"
          data-test-id={preview ? TID.md.source : TID.md.preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? 'Source' : 'Preview'}
        </button>
      </div>
      {notice}
      {preview ? (
        <Preview source={source} />
      ) : (
        <Input.TextArea
          ref={textAreaRef}
          className="md-editor__source"
          data-test-id={TID.addTurn.field(prefixClass)}
          value={source}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          onChange={(e) => changeHandler(e.target.value)}
        />
      )}
    </div>
  );
};

export default MdEditor;

// Редактор исходника md-статьи в форме хода: textarea с кнопками обёртки выделенного и
// переключатель на предпросмотр тем же рендером, что у карточки.

import { TID } from '@/config/testIds';
import { Input } from 'antd';
import { useRef, useState } from 'react';
import { MARK_COLOR_VARS } from './markColors';
import { MD_COLORS } from './markdown';
import { useMdHtml } from './mdRenderer';

const PLACEHOLDER =
  'Markdown: **bold**, *italic*, [link](https://…), # heading, - list, ==g highlight== (y g p b s o)';

const WRAPS = [
  { name: 'bold', title: 'Bold', label: 'B', before: '**', after: '**' },
  { name: 'italic', title: 'Italic', label: 'I', before: '*', after: '*' },
  { name: 'link', title: 'Link', label: '🔗', before: '[', after: '](https://)' },
  ...Object.keys(MD_COLORS).map((letter) => ({
    name: `mark-${letter}`,
    title: `Highlight ${letter}`,
    color: letter,
    before: `==${letter} `,
    after: '==',
  })),
];

const Preview = ({ source }) => {
  const { html } = useMdHtml(source);
  return (
    <div
      className="md-editor__preview md-content"
      data-test-id={TID.md.previewPane}
      style={MARK_COLOR_VARS}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const MdEditor = ({ changeHandler, prefixClass, value }) => {
  const [preview, setPreview] = useState(false);
  const textAreaRef = useRef(null);
  const source = value || '';

  // Обёртка выделенного: курсор остаётся на том же тексте внутри обёртки.
  const wrap = ({ before, after }) => {
    const el = textAreaRef.current?.resizableTextArea?.textArea;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    changeHandler(
      source.slice(0, start) + before + source.slice(start, end) + after + source.slice(end),
    );
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
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
              style={item.color ? { background: MD_COLORS[item.color] } : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrap(item)}
            >
              {item.label || ''}
            </button>
          ))}
        <div className="flex-1" />
        <button
          type="button"
          className="btn btn-primary md-editor__toggle"
          data-test-id={preview ? TID.md.source : TID.md.preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? 'Source' : 'Preview'}
        </button>
      </div>
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

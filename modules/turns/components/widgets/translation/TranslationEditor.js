// Редактор хода «Перевод текста» на месте Quill: языки колонок, ряды из двух textarea
// md-исходника, полоса действий ряда («+» — ряд после него, удаление), Preview той же сеткой,
// что карточка. Ряды живут в form.rows (changeHandler), языки — в form.languages (patchForm).

import { TID } from '@/config/testIds';
import { Input, Modal } from 'antd';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useMdMarkVars } from '../md/MdHtml';
import TranslationGrid from './TranslationGrid';
import {
  dropEmptyRows,
  emptyRow,
  formRows,
  hasRowsContent,
  normalizeLanguages,
} from './rows';

const SIDES = ['left', 'right'];
const CELL_PLACEHOLDER = { left: 'Original text (markdown)', right: 'Translation (markdown)' };
const LANGUAGE_PLACEHOLDER = { left: 'Language of the left column', right: 'Language of the right column' };

// Предпросмотр показывает то, что уйдёт в ход: без пустых рядов, языки обрезаны.
const Preview = ({ rows, languages }) => {
  const markVars = useMdMarkVars();
  const shown = dropEmptyRows(rows);
  return (
    <div
      className="md-editor__preview translation-preview"
      data-test-id={TID.translation.editor.previewPane}
      style={markVars}
    >
      {shown.length ? (
        <TranslationGrid rows={shown} languages={normalizeLanguages(languages)} />
      ) : (
        <div className="md-editor__placeholder">Nothing to preview yet</div>
      )}
    </div>
  );
};

// aside — подпись поля из формы.
const TranslationEditor = ({ changeHandler, prefixClass, value, form, patchForm, aside = null }) => {
  const t = useTranslations('Game.turnForm');
  const [preview, setPreview] = useState(false);
  // id ряда с текстом, который просят удалить; null — окна нет
  const [deleteId, setDeleteId] = useState(null);
  const rows = useMemo(() => formRows(value), [value]);
  const languages = form?.languages || {};
  const editor = TID.translation.editor;

  const setRows = (next) => changeHandler(next);
  const setLanguage = (side, text) =>
    patchForm((prev) => ({
      ...prev,
      languages: { ...(prev.languages || {}), [side]: text },
    }));
  const setCell = (id, side, text) =>
    setRows(rows.map((row) => (row.id === id ? { ...row, [side]: text } : row)));
  const addRowAfter = (id) => {
    const next = [...rows];
    next.splice(rows.findIndex((row) => row.id === id) + 1, 0, emptyRow());
    setRows(next);
  };
  const addRowAtEnd = () => setRows([...rows, emptyRow()]);
  const removeRow = (id) => {
    const next = rows.filter((row) => row.id !== id);
    setRows(next.length ? next : [emptyRow()]);
  };
  const requestRemove = (row) => {
    if (hasRowsContent([row])) setDeleteId(row.id);
    else removeRow(row.id);
  };

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
        <div className="translation-editor__body">
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
          {rows.map((row) => (
            <div
              className="translation-editor__row"
              key={row.id}
              data-test-id={editor.row}
              data-row-id={row.id}
            >
              {SIDES.map((side) => (
                <Input.TextArea
                  key={side}
                  className="translation-editor__cell"
                  data-test-id={editor.cell}
                  data-side={side}
                  value={row[side]}
                  placeholder={CELL_PLACEHOLDER[side]}
                  autoSize={{ minRows: 2 }}
                  onChange={(e) => setCell(row.id, side, e.target.value)}
                />
              ))}
              <div className="translation-editor__actions">
                <button
                  type="button"
                  className="md-editor__tool"
                  title="Add a row below"
                  data-test-id={editor.addRowAfter}
                  data-row-id={row.id}
                  onClick={() => addRowAfter(row.id)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="md-editor__tool"
                  title="Delete the row"
                  data-test-id={editor.deleteRow}
                  data-row-id={row.id}
                  onClick={() => requestRemove(row)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary translation-editor__add"
            data-test-id={editor.addRow}
            onClick={addRowAtEnd}
          >
            + Row
          </button>
        </div>
      )}

      {/* Окно контролируемое, а не Modal.confirm: статические методы antd не видят контекст темы. */}
      <Modal
        open={deleteId !== null}
        title={t('translation.deleteRow.Title')}
        okText={t('translation.deleteRow.Ok')}
        cancelText={t('translation.deleteRow.Cancel')}
        okButtonProps={{ danger: true, 'data-test-id': editor.deleteOk }}
        cancelButtonProps={{ 'data-test-id': editor.deleteCancel }}
        onCancel={() => setDeleteId(null)}
        onOk={() => {
          removeRow(deleteId);
          setDeleteId(null);
        }}
      >
        <p className="mb-0" data-test-id={editor.deleteConfirm} data-row-id={deleteId || ''}>
          {t('translation.deleteRow.Text')}
        </p>
      </Modal>
    </div>
  );
};

export default TranslationEditor;

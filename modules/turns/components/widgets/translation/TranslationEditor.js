// Редактор хода «Перевод текста» на месте Quill: языки колонок, ряды из двух textarea
// md-исходника, полоса действий ряда (сохранить ряд, «+» — ряд после него, удаление), Preview той
// же сеткой, что карточка. Ряды живут в form.rows (changeHandler), языки — в form.languages
// (patchForm), сохранённое — в черновике рядов (draft.js). Сохранение ряда и удаление
// сохранённого ряда уходят на сервер сразу; у нового хода и при смене типа — только общим Save.

import { TID } from '@/config/testIds';
import { Input, Modal } from 'antd';
import { useTranslations } from 'next-intl';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMdMarkVars } from '../md/MdHtml';
import { useMdRenderer } from '../md/mdRenderer';
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
const AUTO_SIZE = { minRows: 2 };
const NO_CONFIRM = { open: false, id: null, saved: false };

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

// Предпросмотр показывает то, что уйдёт в ход: без пустых рядов, языки обрезаны.
const Preview = ({ rows, languages }) => {
  const t = useTranslations('Game.translation');
  const markVars = useMdMarkVars();
  const ready = !!useMdRenderer();
  const shown = dropEmptyRows(rows);
  return (
    <div
      className="md-editor__preview translation-preview"
      data-test-id={TID.translation.editor.previewPane}
      style={markVars}
    >
      {!shown.length ? (
        <div className="md-editor__placeholder">Nothing to preview yet</div>
      ) : ready ? (
        <TranslationGrid rows={shown} languages={normalizeLanguages(languages)} />
      ) : (
        <div className="md-editor__placeholder" data-test-id={TID.translation.loading}>
          {t('loading')}
        </div>
      )}
    </div>
  );
};

// Ряд — memo с устойчивыми пропсами: набор текста в ячейке перерисовывает только свой ряд.
// live — ряды ходят на сервер по одному; last — единственный сохранённый ряд с текстом.
const EditorRow = memo(({ row, saved, live, busy, last, actions, titles }) => {
  const editor = TID.translation.editor;
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
      data-test-id={editor.row}
      data-row-id={row.id}
      data-row-state={dirty.state}
      data-busy={busy ? 'true' : undefined}
    >
      {SIDES.map((side) => (
        <Input.TextArea
          key={side}
          className="translation-editor__cell"
          data-test-id={editor.cell}
          data-side={side}
          data-dirty={dirty[side] ? 'true' : undefined}
          value={row[side]}
          placeholder={CELL_PLACEHOLDER[side]}
          autoSize={AUTO_SIZE}
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
          {busy ? '…' : '💾'}
        </button>
        <button
          type="button"
          className="md-editor__tool"
          title="Add a row below"
          data-test-id={editor.addRowAfter}
          data-row-id={row.id}
          onClick={() => actions.addAfter(row.id)}
        >
          +
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
          🗑
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
    return {
      drop,
      cell: (id, side, text) => {
        const { rows, changeHandler } = now.current;
        changeHandler(rows.map((row) => (row.id === id ? { ...row, [side]: text } : row)));
      },
      addAfter: (id) => {
        const { rows, changeHandler } = now.current;
        const next = [...rows];
        next.splice(rows.findIndex((row) => row.id === id) + 1, 0, emptyRow());
        changeHandler(next);
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
  const addRowAtEnd = () => changeHandler([...rows, emptyRow()]);
  const onlyText = live ? onlyTextRowId(base) : null;

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
            <EditorRow
              key={row.id}
              row={row}
              saved={savedRow(base, row.id)}
              live={live}
              busy={!!pending[row.id]}
              last={onlyText === row.id}
              actions={actions}
              titles={titles}
            />
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

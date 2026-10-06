import {
  checkIfParagraphExists,
  getQuill,
  getQuoteElements,
  isSameContents,
  QUOTE_ID_ATTRIBUTE,
} from '@/modules/turns/components/helpers/quillHelper';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import turnSettings, { WIDGET_HEADER } from '@/modules/turns/settings';
import FormInput from './FormInput';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleMaximizeQuill,
  togglePanel,
} from '@/modules/panels/redux/actions';
import PanelButton from '@/modules/panels/components/PanelButton';
import EditorPanelSplit from '@/modules/panels/components/EditorPanelSplit';
import {
  clampEditorFontSize,
  readEditorFontSize,
  saveEditorFontSize,
} from '@/modules/panels/helpers/editorPanel';
import {
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_MIN,
  EDITOR_FONT_SIZE_STEP,
  PANEL_ADD_EDIT_TURN,
} from '@/config/panel';
import { createTurn, resaveTurn, uploadMedia } from '../../redux/actions';
import { dataUrlToFile, frameFileName } from '../helpers/videoFrame';
import {
  buildTurnSave,
  comparableFields,
  hasTurnContent,
  prepareFields,
  sameFields,
} from './turnFormSave';
import { clearQuotesInfo, linesDelete } from '@/modules/lines/redux/actions';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';
import DropdownTemplate from '../inputs/DropdownTemplate';
import { DatePicker, Input, Modal, Switch } from 'antd';
import dayjs from 'dayjs';
import { cleanText, getFormatLoss } from '../helpers/textHelper';
import { TurnHelper } from '../../redux/helpers';
import { createFormEdition } from '../helpers/formEdition';
import { useMediaLinkCheck } from './useMediaLinkCheck';
import { TID } from '@/config/testIds';
import { castSaved } from '@/modules/presence/redux/actions';

const {
  settings,
  templatesToShow,
  fieldSettings,
  fieldsToShow,
  TEMPLATE_PICTURE,
  FIELD_DONT_SHOW_HEADER,
  FIELD_HEADER,
  FIELD_SOURCE,
  FIELD_DATE,
} = turnSettings;

const SAVE_HINTS = {
  empty: 'Nothing to save: the turn is empty',
  unchanged: 'Nothing to save: no changes',
  checking: 'Checking the link…',
  preview: 'Uploading the video preview…',
};

const AddEditTurnPopup = () => {
  const t = useTranslations('Game.turnForm');
  const gamePosition = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.game.viewport);
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const turnData = useSelector((state) => state.turns.d[editTurnId]);
  const turnGeometry = useSelector((state) => state.turns.g[editTurnId]);
  const activeQuoteKey = useSelector((state) => state.quotes.activeQuoteKey);
  // @fixme
  const turnToEdit = useMemo(
    () =>
      turnData && turnGeometry
        ? TurnHelper.toOldFields({
            ...turnData,
            ...turnGeometry,
          })
        : null,
    [turnData, turnGeometry],
  );
  const [quillConstants, setQuillConstants] = useState({}); // { quill, getQuillTextArr }
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATE_PICTURE);
  const [error, setError] = useState(null);
  const templateSettings = settings[activeTemplate];

  const availableFields = templateSettings.availableFields || [];
  const Component = templateSettings.component || null;
  const [form, setForm] = useState({
    check: true,
  });
  const [isMaximized, setIsMaximized] = useState(false);
  // Шрифт редактора (A− / A+) помнится на пользователя и в ход не пишется; читается
  // в эффекте — хранилище есть только в браузере.
  const [fontSize, setFontSize] = useState(EDITOR_FONT_SIZE_DEFAULT);
  // Окно замены файла: { payload, summary }, payload уходит в commitSave по «Удалить и сохранить».
  const [orphanConfirm, setOrphanConfirm] = useState(null);
  // Окно потери связей снятых текстовых цитат: { payload, summary }, как у окна замены файла.
  const [lostLinksConfirm, setLostLinksConfirm] = useState(null);
  // Подтверждение перед Format: что именно снимется с абзаца (getFormatLoss).
  // null — окна нет, значит и терять было нечего.
  const [formatConfirm, setFormatConfirm] = useState(null);
  // Редакция, чей кадр сейчас грузится: Save блокируется только у неё.
  const [savingPreview, setSavingPreview] = useState(0);
  // Quill неуправляемый: копия абзаца для Save обновляется по text-change.
  const [editorOps, setEditorOps] = useState([]);
  // Снимок открытого на правку хода { token, template, fields, paragraph }; null —
  // форма ещё устаивается или ход новый.
  const [baseline, setBaseline] = useState(null);
  const formRef = useRef(form);
  formRef.current = form;

  // Начатый формой ответ применяется только к ней самой: у каждого открытого хода
  // своя редакция, у закрытой панели актуальной редакции нет.
  const editionRef = useRef(null);
  if (!editionRef.current) editionRef.current = createFormEdition();
  const edition = editionRef.current;
  edition.open(editTurnId);
  useEffect(() => () => edition.close(), []);

  const dispatch = useDispatch();

  const hidePanel = () => {
    dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
    dispatch(toggleMaximizeQuill(false));
  };
  const dLines = useSelector((state) => state.lines.d);
  const lines = useMemo(() => Object.values(dLines), [dLines]);

  const toggleMaximize = (value) => {
    setIsMaximized(value);
    dispatch(toggleMaximizeQuill(value));
  };

  // Перечитывается и после сброса раскладки в Info — при открытой форме.
  const layoutResets = useSelector((state) => state.panels.layoutResets);
  useEffect(() => {
    setFontSize(readEditorFontSize());
  }, [layoutResets]);

  const changeFontSize = (delta) => {
    const next = clampEditorFontSize(fontSize + delta);
    setFontSize(next);
    saveEditorFontSize(next);
  };

  useEffect(() => {
    if (!quillConstants.quill) return;
    setBaseline(null);
    if (!!turnToEdit) {
      setActiveTemplate(turnToEdit.contentType);
      const newForm = {};
      for (let fieldToShow of fieldsToShow) {
        if (!!turnToEdit[fieldToShow]) {
          if (!!fieldSettings[fieldToShow].valueCallback) {
            newForm[fieldToShow] =
              fieldSettings[fieldToShow].valueCallback(turnToEdit); // можно использовать не только для даты, но и для других полей
          } else {
            newForm[fieldToShow] = turnToEdit[fieldToShow]; // получаем все поля кроме параграфа
          }
        }
      }
      if (turnToEdit.videoPreview) newForm.videoPreview = turnToEdit.videoPreview;
      setForm(newForm);
      const { quill } = quillConstants;
      quill.setContents(turnToEdit.paragraph || []);
      const token = edition.token();
      setTimeout(() => {
        // за эти 300 мс могли открыть другой ход — его цитатам чужие id не ставим
        if (!edition.isCurrent(token)) return;
        const paragraphQuotes = turnToEdit.quotes
          ? turnToEdit.quotes.filter((quote) => quote.type === 'text')
          : [];
        const quoteEls = getQuoteElements();
        let i = 0;
        let incId = Math.floor(new Date().getTime() / 1000);
        for (let quoteEl of quoteEls) {
          // По порядку — только ходам старше атрибутора.
          if (!quoteEl.getAttribute(QUOTE_ID_ATTRIBUTE)) {
            const quoteId = paragraphQuotes[i]
              ? paragraphQuotes[i].id
              : (incId += 1);
            quoteEl.setAttribute(QUOTE_ID_ATTRIBUTE, quoteId);
          }
          i += 1;
        }
        // Проставленные id Quill заберёт из DOM только следующим тиком — забираем
        // сейчас, иначе они придут после снимка и сойдут за правку.
        quill.update();
        const paragraph = quill.getContents().ops;
        setEditorOps(paragraph);
        setBaseline({
          token,
          template: turnToEdit.contentType,
          fields: comparableFields(formRef.current, turnToEdit.contentType),
          paragraph,
        });
      }, 300);
    } else {
      setForm({});
      const { quill } = quillConstants;
      if (!!quill) {
        quill.setContents([]);
      }
    }
  }, [turnToEdit, quillConstants]);

  useEffect(() => {
    setQuillConstants(
      getQuill('#editor-container-new', '#toolbar-container-new'),
    );
  }, []);

  useEffect(() => {
    const { quill } = quillConstants;
    if (!quill) return;
    const sync = () => setEditorOps(quill.getContents().ops);
    sync();
    quill.on('text-change', sync);
    return () => quill.off('text-change', sync);
  }, [quillConstants]);

  // Сама запись. Между Save и ней могут встать окна, отвечающие позже, поэтому её
  // зовёт последний шаг: finishSave или «Удалить и сохранить».
  const commitSave = async ({
    turnObj: preparedTurn,
    lineIdsToDelete,
    isNew,
    quoteKeysDeleted = [],
    previewDraft,
    editionToken,
  }) => {
    let turnObj = preparedTurn;
    // Форму могли закрыть или перевести на другой ход, пока media отвечала: сам ход
    // сохраняется (его просили сохранить), а форму трогает только своя редакция.
    const token = editionToken || edition.token();
    // Кадр живёт в памяти формы и уходит в media один раз — здесь.
    if (previewDraft) {
      setSavingPreview(token);
      try {
        const file = dataUrlToFile(
          previewDraft.dataUrl,
          frameFileName(previewDraft.name, previewDraft.t),
        );
        const data = await dispatch(uploadMedia('images', file));
        turnObj = { ...turnObj, videoPreview: data.src };
        if (edition.isCurrent(token)) {
          patchForm({ videoPreview: data.src, videoPreviewDraft: null });
        }
      } catch (err) {
        if (edition.isCurrent(token)) {
          patchForm({
            videoPreviewError: `Preview upload failed: ${err?.message || err}`,
          });
        }
        return;
      } finally {
        setSavingPreview((prev) => (prev === token ? 0 : prev));
      }
    }

    const linesDeleted = lineIdsToDelete.length
      ? dispatch(linesDelete(lineIdsToDelete))
      : null;
    if (quoteKeysDeleted.length) {
      dispatch(clearQuotesInfo(quoteKeysDeleted));
      // цитата, снятая этим сохранением, не может остаться активной
      if (quoteKeysDeleted.includes(activeQuoteKey)) {
        dispatch(setActiveQuoteKey(null));
      }
    }

    const saveCallbacks = {
      // @todo: передавать в виджет через props
      // Закрывается только сохранявшаяся форма: поздний ответ не трогает другую правку.
      success: () => {
        // Спутникам ведущего — и после закрытия формы, но не раньше удаления линий
        // снятых цитат: иначе их перезапрос застанет эти линии.
        Promise.resolve(linesDeleted).then(() => dispatch(castSaved()));
        if (!edition.isCurrent(token)) return;
        dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN, open: false }));
        dispatch(toggleMaximizeQuill(false));
      },
    };

    // @fixme
    dispatch(
      isNew
        ? createTurn(turnObj, saveCallbacks)
        : resaveTurn(turnObj, saveCallbacks),
    );
  };

  // Цитаты и связи теряются молча, только если терять нечего; отказ в окне не
  // сохраняет ничего — остаются и прежний файл, и цитаты, и связи.
  const finishSave = ({ payload, orphanSummary, lostLinks }) => {
    if (orphanSummary) {
      setOrphanConfirm({ payload, summary: orphanSummary });
      return;
    }
    if (lostLinks) {
      setLostLinksConfirm({ payload, summary: lostLinks });
      return;
    }
    commitSave(payload);
  };

  const {
    checkMediaLinks,
    checking: checkingLink,
    notMedia,
    notMediaText,
    cancelNotMedia,
    confirmNotMedia,
    afterNotMediaClose,
  } = useMediaLinkCheck({ edition, onChecked: finishSave });

  const saveHandler = (e) => {
    e.preventDefault(); // почитать про preventDefault()
    if (checkingLink) return;
    const save = buildTurnSave({
      textArr: quillConstants.getQuillTextArr(),
      quoteElementIds: getQuoteElements().map((quoteEl) =>
        quoteEl.getAttribute(QUOTE_ID_ATTRIBUTE),
      ),
      form,
      template: activeTemplate,
      turnToEdit,
      dWidgets: turnData?.dWidgets,
      lines,
      position: gamePosition,
      viewport,
      now: Date.now(),
      editionToken: edition.token(),
      paragraphExists: checkIfParagraphExists,
    });
    if (save.error) return setError(save.error);
    const { payload, orphanSummary, lostLinks, changedLinks } = save;
    checkMediaLinks(changedLinks, { payload, orphanSummary, lostLinks });
  };

  // Format заменяет документ плоским текстом и теряет разметку; старые диапазоны на
  // новый текст не перенести, поэтому при потерях сначала спрашиваем.
  const applyFormat = () => {
    const { quill } = quillConstants;
    quill.setText(cleanText(quill.getText()));
  };

  const formatHandler = () => {
    const loss = getFormatLoss(quillConstants.getQuillTextArr());
    if (!loss.total) return applyFormat();
    setFormatConfirm(loss);
  };

  // Только функциональный setState: два ColorPicker'а ставят дефолты в эффектах одного
  // коммита, и `{ ...form }` из замыкания терял значение первого.
  const formChangeHandler = (field, value) => {
    if (!!error) setError(null);

    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  // Несколько полей разом; patch — объект или функция от прежней формы.
  const patchForm = (patch) =>
    setForm((prevForm) => ({
      ...prevForm,
      ...(typeof patch === 'function' ? patch(prevForm) : patch),
    }));

  const paragraphChanged = useMemo(
    () => !!baseline && !isSameContents(editorOps, baseline.paragraph),
    [editorOps, baseline],
  );
  const hasContent = hasTurnContent(
    activeTemplate,
    prepareFields(form, activeTemplate),
    checkIfParagraphExists(editorOps),
  );
  const changed =
    !!baseline &&
    edition.isCurrent(baseline.token) &&
    (activeTemplate !== baseline.template ||
      paragraphChanged ||
      !sameFields(comparableFields(form, activeTemplate), baseline.fields));
  let saveState = 'ready';
  if (edition.isCurrent(savingPreview)) saveState = 'preview';
  else if (checkingLink) saveState = 'checking';
  else if (!hasContent) saveState = 'empty';
  else if (turnToEdit && !changed) saveState = 'unchanged';

  // Шаблон, заголовок, источник и дата — общие для обеих раскладок формы.
  const headRows = (withHeader, switchClassName) => (
    <>
      <div className="panel-flex mb-2">
        <div className="w-1/6">
          <DropdownTemplate
            {...{
              templatesToShow,
              settings,
              activeTemplate,
              setError,
              setActiveTemplate,
            }}
          />
        </div>
        {withHeader && (
          <>
            <div className="w-2/3">
              <Input
                placeholder="Header:"
                data-test-id={TID.addTurn.field('header')}
                value={form[FIELD_HEADER]}
                onChange={(e) =>
                  formChangeHandler(FIELD_HEADER, e.target.value)
                }
              />
            </div>
            <div className={switchClassName}>
              <Switch
                defaultChecked={true}
                checked={!form[FIELD_DONT_SHOW_HEADER]}
                onChange={(checked) => {
                  formChangeHandler(FIELD_DONT_SHOW_HEADER, !checked);
                }}
              />
            </div>
          </>
        )}
      </div>
      <div className="panel-flex mb-2">
        <div className="w-7/12">
          <Input
            placeholder="Source URL:"
            data-test-id={TID.addTurn.field('source')}
            value={form[FIELD_SOURCE]}
            onChange={(e) => formChangeHandler(FIELD_SOURCE, e.target.value)}
          />
        </div>
        <div className="w-1/4">
          <DatePicker
            value={form[FIELD_DATE] ? dayjs(form[FIELD_DATE]) : null}
            data-test-id={TID.addTurn.field('date')}
            style={{ width: '100%' }}
            onChange={(d) =>
              formChangeHandler(FIELD_DATE, d?.format('YYYY-MM-DD'))
            }
          />
        </div>
      </div>
    </>
  );

  if (Component) {
    return (
      <>
      <EditorPanelSplit />
      <div
        className={`panel-inner flex flex-col h-full flex-1`}
      >
        <div className="panel-cell">
          {headRows(
            templateSettings.optionalWidgets.includes(WIDGET_HEADER),
            'w-1/6',
          )}

          {!!error && <div className="alert alert-danger">{error.message}</div>}
        </div>
        <Component />
      </div>
      </>
    );
  }

  return (
    <>
      <EditorPanelSplit />
      <div
        className={`panel-inner flex flex-col h-full flex-1`}
      >
        {!isMaximized && (
          <>
            <div className="panel-cell">
              {headRows(true)}
              {fieldsToShow
                .filter((field) => {
                  if (
                    !fieldSettings[field].special &&
                    !fieldSettings[field].separate
                  ) {
                    return true;
                  }
                  return availableFields.includes(field);
                })
                .map((field) => {
                  return (
                    <FormInput
                      changeHandler={(value) => formChangeHandler(field, value)}
                      label={fieldSettings[field].label}
                      prefixClass={fieldSettings[field].prefixClass}
                      inputType={fieldSettings[field].inputType}
                      key={field}
                      value={form[field] || ''}
                      widgetSettings={fieldSettings[field].widgetSettings}
                      form={form}
                      patchForm={patchForm}
                      edition={edition}
                    />
                  );
                })}
              {!!error && (
                <div className="alert alert-danger">{error.message}</div>
              )}
            </div>
          </>
        )}
        <div
          className="flex-1 quill-wrapper panel-cell mt-0"
          style={{ '--editor-font-size': `${fontSize}px` }}
          data-font-size={fontSize}
        >
          <div id="toolbar-container-new">
            <span className="ql-formats">
              <select className="ql-background">
                {[
                  '',
                  'rgb(255, 255, 0)',
                  'rgb(138, 255, 36)',
                  'rgb(253, 201, 255)',
                  'rgb(156, 245, 255)',
                  'rgb(210, 211, 212)',
                  'rgb(255, 213, 150)',
                ].map((val, i) => (
                  <option value={val} key={i} />
                ))}
              </select>
              <button
                className="ql-bold"
                data-test-id={TID.addTurn.toolbar('bold')}
              />
              <button
                className="ql-italic"
                data-test-id={TID.addTurn.toolbar('italic')}
              />
              <button className="ql-link" />
            </span>
          </div>
          <div id="editor-container-new" />
        </div>
        <div className="panel-cell">
          <div className="panel-flex panel-buttons">
            <button
              className="btn btn-primary btn-accent"
              data-test-id={TID.addTurn.save}
              data-save-state={saveState}
              disabled={saveState !== 'ready'}
              title={SAVE_HINTS[saveState]}
              onClick={(e) => saveHandler(e)}
            >
              {saveState === 'checking' ? 'Checking…' : 'Save'}
            </button>
            <button
              className="btn btn-primary"
              data-test-id={TID.addTurn.cancel}
              onClick={(e) => hidePanel()}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              data-test-id={TID.addTurn.format}
              onClick={() => formatHandler()}
            >
              Format
            </button>

            <PanelButton
              data-test-id={TID.addTurn.fontDec}
              title="Smaller text in the editor"
              disabled={fontSize <= EDITOR_FONT_SIZE_MIN}
              onClick={() => changeFontSize(-EDITOR_FONT_SIZE_STEP)}
            >
              A−
            </PanelButton>
            <PanelButton
              data-test-id={TID.addTurn.fontInc}
              title="Larger text in the editor"
              disabled={fontSize >= EDITOR_FONT_SIZE_MAX}
              onClick={() => changeFontSize(EDITOR_FONT_SIZE_STEP)}
            >
              A+
            </PanelButton>

            <div className="flex-1" />
            <button
              className="btn btn-primary"
              style={{ width: '90px' }}
              onClick={(e) => toggleMaximize(isMaximized ? false : true)}
            >
              {!isMaximized ? 'Maximize' : 'Back'}
            </button>
          </div>
        </div>
      </div>

      {/* Окно контролируемое, а не Modal.confirm: статические методы antd не видят
          контекст темы, а в состоянии лежит уже собранное сохранение. */}
      <Modal
        open={!!orphanConfirm}
        title={t('orphan.Title')}
        okText={t('orphan.Ok')}
        cancelText={t('orphan.Cancel')}
        okButtonProps={{ danger: true }}
        onCancel={() => setOrphanConfirm(null)}
        onOk={() => {
          const { payload } = orphanConfirm;
          setOrphanConfirm(null);
          commitSave(payload);
        }}
      >
        {!!orphanConfirm && (
          <>
            <p>{t('orphan.Text')}</p>
            <p className="mb-0">
              {t.rich('orphan.Count', {
                quotes: orphanConfirm.summary.quotesCount,
                byWidget: orphanConfirm.summary.byWidget
                  .map(({ kind, count }) => `${t(`widgets.${kind}`)} — ${count}`)
                  .join(', '),
                links: orphanConfirm.summary.linesCount,
                b: (chunks) => <b>{chunks}</b>,
              })}
            </p>
          </>
        )}
      </Modal>

      <Modal
        open={!!lostLinksConfirm}
        title={t('lostLinks.Title')}
        okText={t('lostLinks.Ok')}
        cancelText={t('lostLinks.Cancel')}
        okButtonProps={{
          danger: true,
          'data-test-id': TID.addTurn.lostLinksSave,
        }}
        cancelButtonProps={{ 'data-test-id': TID.addTurn.lostLinksCancel }}
        onCancel={() => setLostLinksConfirm(null)}
        onOk={() => {
          const { payload } = lostLinksConfirm;
          setLostLinksConfirm(null);
          commitSave(payload);
        }}
      >
        {!!lostLinksConfirm && (
          <div
            data-test-id={TID.addTurn.lostLinks}
            data-quotes={lostLinksConfirm.summary.quotesCount}
            data-links={lostLinksConfirm.summary.linesCount}
          >
            <p>{t('lostLinks.Text')}</p>
            <p className="mb-0">
              {t.rich('lostLinks.Count', {
                quotes: lostLinksConfirm.summary.quotesCount,
                links: lostLinksConfirm.summary.linesCount,
                b: (chunks) => <b>{chunks}</b>,
              })}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!notMedia}
        title={notMediaText.title}
        okText={t('notMedia.Ok')}
        cancelText={t('notMedia.Cancel')}
        okButtonProps={{ 'data-test-id': TID.addTurn.notMediaSave }}
        cancelButtonProps={{ 'data-test-id': TID.addTurn.notMediaCancel }}
        onCancel={cancelNotMedia}
        onOk={confirmNotMedia}
        afterClose={afterNotMediaClose}
      >
        {!!notMedia && (
          <div
            data-test-id={TID.addTurn.notMedia}
            data-field={notMedia.name}
            data-reason={notMedia.reason}
          >
            <p>
              {notMedia.reason === 'type' ? notMediaText.type : notMediaText.load}
            </p>
            <p className="mb-0" style={{ wordBreak: 'break-all' }}>
              {notMedia.url}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!formatConfirm}
        title={t('format.Title')}
        okText={t('format.Ok')}
        cancelText={t('format.Cancel')}
        okButtonProps={{
          danger: !!formatConfirm?.quotes,
          'data-test-id': TID.addTurn.formatConfirm,
        }}
        onCancel={() => setFormatConfirm(null)}
        onOk={() => {
          setFormatConfirm(null);
          applyFormat();
        }}
      >
        {!!formatConfirm && (
          <>
            <p>{t('format.Text')}</p>
            <p className="mb-0">
              {t.rich('format.Count', {
                quotes: formatConfirm.quotes,
                links: formatConfirm.links,
                marked: formatConfirm.marked,
                b: (chunks) => <b>{chunks}</b>,
              })}
            </p>
          </>
        )}
      </Modal>
    </>
  );
};

export default AddEditTurnPopup;

import { getQuill } from '@/modules/turns/components/helpers/quillHelper';
import { useEffect, useState, useMemo } from 'react';
import turnSettings, { WIDGET_HEADER } from '@/modules/turns/settings';
import FormInput from './FormInput';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleMaximizeQuill,
  togglePanel,
} from '@/modules/panels/redux/actions';
import { PANEL_ADD_EDIT_TURN } from '@/config/panel';
import { createTurn, resaveTurn } from '../../redux/actions';
import {
  filterQuotesDeleted,
  filterQuotesOrphanedByMedia,
} from '@/modules/quotes/components/helpers/filters';
import { filterLinesByQuoteKeys } from '@/modules/lines/components/helpers/line';
import { linesDelete } from '@/modules/lines/redux/actions';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import DropdownTemplate from '../inputs/DropdownTemplate';
import { Button, DatePicker, Input, Modal, Switch } from 'antd';
import dayjs from 'dayjs';
import { cleanText } from '../helpers/textHelper';
import { TurnHelper } from '../../redux/helpers';
import { TID } from '@/config/testIds';

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

// Что именно потеряет ход, если сохранить замену файла (BP-26): цитаты старого
// файла и логические линии, которые на них держались.
const getOrphanedSummary = (orphaned, linesCount) => ({
  quotesCount: orphaned.reduce((sum, item) => sum + item.quotes.length, 0),
  byWidget: orphaned
    .map((item) => `${item.label} — ${item.quotes.length}`)
    .join(', '),
  linesCount,
});

const getDate = (mixedDate) => {
  const d = new Date(mixedDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDay()).padStart(2, '0')}`;
};

const AddEditTurnPopup = () => {
  const gamePosition = useSelector((state) => state.game.position);
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const turnData = useSelector((state) => state.turns.d[editTurnId]);
  const turnGeometry = useSelector((state) => state.turns.g[editTurnId]);
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
  const requiredFields = templateSettings.requiredFields || [];
  const requiredParagraph = templateSettings.requiredParagraph || false;
  const Component = templateSettings.component || null;
  const [form, setForm] = useState({
    check: true,
  });
  const [isMaximized, setIsMaximized] = useState(false);
  // Подтверждение удаления цитат при замене файла (BP-26): здесь лежит уже
  // собранное сохранение и то, что о нём показать. null — окна нет.
  // { payload, summary } — payload уходит в commitSave по «Удалить и сохранить».
  const [orphanConfirm, setOrphanConfirm] = useState(null);

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

  useEffect(() => {
    if (!quillConstants.quill) return;
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
      setForm(newForm);
      if (turnToEdit.paragraph) {
        const { quill } = quillConstants;
        quill.setContents(turnToEdit.paragraph);
        setTimeout(() => {
          const paragraphQuotes = turnToEdit.quotes
            ? turnToEdit.quotes.filter((quote) => quote.type === 'text')
            : [];
          const spans = document.querySelectorAll('.ql-editor span');
          let i = 0;
          let incId = Math.floor(new Date().getTime() / 1000);
          for (let span of spans) {
            const quoteId = paragraphQuotes[i]
              ? paragraphQuotes[i].id
              : (incId += 1);
            span.setAttribute('id', quoteId);
            i += 1;
          }
        }, 300);
      }
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

  // Само сохранение. Вынесено из saveHandler, потому что при замене файла между
  // «нажал Save» и записью встаёт модальное окно, а оно отвечает асинхронно
  // (BP-26): saveHandler только собирает payload, коммитит либо он сам, либо
  // кнопка «Удалить и сохранить».
  const commitSave = ({ turnObj, lineIdsToDelete, isNew }) => {
    if (lineIdsToDelete.length) {
      dispatch(linesDelete(lineIdsToDelete));
    }

    const saveCallbacks = {
      // @todo: передавать в виджет через props
      success: () => {
        dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
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

  const saveHandler = (e) => {
    e.preventDefault(); // почитать про preventDefault()
    const textArr = quillConstants.getQuillTextArr();

    let incId = Math.floor(new Date().getTime() / 1000);

    const resTextArr = [];
    let i = 0;
    const spans = document.querySelectorAll('.ql-editor span');

    let j = 0;
    let newIncId = Math.floor(new Date().getTime() / 1000);
    const spanIds = [];
    for (let span of spans) {
      if (span.id) {
        spanIds.push(span.id);
      } else {
        newIncId += 1;
        spanIds.push(newIncId);
      }
      j += 1;
    }

    for (let textItem of textArr) {
      if (!textItem.attributes || !textItem.attributes.background) {
        resTextArr.push(textItem);
        continue;
      }

      let quoteId = textItem.attributes.id;

      if (!quoteId) {
        quoteId = !!turnToEdit && spanIds[i] ? spanIds[i] : (incId += 1);
      }
      i += 1;
      resTextArr.push({
        ...textItem,
        attributes: {
          ...textItem.attributes,
          id: quoteId,
        },
      });
    }

    const preparedForm = {};
    for (let fieldToShow of fieldsToShow) {
      if (
        !fieldSettings[fieldToShow].special ||
        availableFields.includes(fieldToShow)
      ) {
        preparedForm[fieldToShow] = form[fieldToShow];
      } else {
        preparedForm[fieldToShow] = null;
      }
    }

    for (let requiredField of requiredFields) {
      if (!preparedForm[requiredField]) {
        return setError({ message: `Need ${requiredField}` });
      }
    }

    if (
      requiredParagraph &&
      (!resTextArr ||
        !resTextArr.length ||
        (resTextArr.length === 1 && resTextArr[0].insert.trim() === ''))
    ) {
      return setError({ message: 'Need text body' });
    }

    const quotes = [];

    for (let textItem of resTextArr) {
      if (textItem.attributes && textItem.attributes.id) {
        quotes.push({
          id: textItem.attributes.id,
          text: textItem.insert,
          type: 'text',
        });
      }
    }

    const prevQuotes = turnToEdit?.quotes || [];

    // Замена файла обесценивает цитаты, заданные в его координатах (BP-26):
    // прямоугольные у картинки и pdf, отрезки таймлайна у видео и аудио. Правило
    // одно на все типы (TURN_MEDIA_QUOTE_BINDINGS) и срабатывает одинаково на
    // замену файла, его очистку и смену типа хода.
    const orphaned = turnToEdit
      ? filterQuotesOrphanedByMedia({
          prevFields: turnToEdit,
          nextFields: preparedForm,
          prevQuotes,
          getTimelineQuotes: (widgetId) =>
            turnData?.dWidgets?.[widgetId]?.quotes,
        })
      : [];

    const dOrphanedQuoteIds = {};
    for (const item of orphaned) {
      for (const quote of item.quotes) {
        dOrphanedQuoteIds[quote.id] = true;
      }
    }

    for (let prevQuote of prevQuotes) {
      if (
        prevQuote.type !== TYPE_QUOTE_TEXT &&
        !dOrphanedQuoteIds[prevQuote.id]
      ) {
        quotes.push(prevQuote);
      }
    }

    // Осиротевшие цитаты остались в prevQuotes и не попали в quotes, поэтому
    // filterQuotesDeleted их и посчитает — линии за ними удалит общий путь в
    // commitSave, отдельной ветки удаления для них не заводим.
    const quotesDeleted = filterQuotesDeleted(prevQuotes, quotes);

    const quoteKey = (quote) => `${turnToEdit._id}_${quote.id}`;
    const linesToDelete = turnToEdit
      ? filterLinesByQuoteKeys(lines, quotesDeleted.map(quoteKey))
      : [];

    // Отдельно — линии, которые держались именно на цитатах заменённого файла:
    // о них спрашивает окно, поэтому и счётчик в нём должен быть про них, а не
    // про весь набор удаляемого (в тот же проход мог измениться и текст).
    const orphanedLines = orphaned.length
      ? filterLinesByQuoteKeys(
          lines,
          orphaned.flatMap((item) => item.quotes).map(quoteKey),
        )
      : [];

    let turnObj = {
      ...preparedForm,
      paragraph: resTextArr,
      contentType: activeTemplate,
      quotes: [...quotes],
    };

    // Таймлайн видео/аудио лежит не в `quotes`, а отдельным полем хода, и его
    // фрагменты обязаны покрывать длительность файла целиком (иначе виджет бросает
    // «Last quote should end at duration»). У нового файла длительность другая,
    // поэтому виджет снимается целиком — так же, как это делает
    // deleteVideoQuotesWidget. На новом файле его можно добавить заново.
    for (const item of orphaned) {
      if (item.timelineField) {
        turnObj[item.timelineField] = null;
      }
    }

    if (!!turnToEdit) {
      turnObj._id = turnToEdit._id;
      turnObj.x = turnToEdit.x;
      turnObj.y = turnToEdit.y;
    } else {
      turnObj.height = 600;
      turnObj.width = 800;
      turnObj.x =
        gamePosition.x + Math.round(window.innerWidth / 2 - turnObj.width / 2);
      turnObj.y =
        gamePosition.y +
        Math.round(window.innerHeight / 2 - turnObj.height / 2);
    }

    const payload = {
      turnObj,
      isNew: !turnToEdit,
      lineIdsToDelete: linesToDelete.map((line) => line._id),
    };

    // Цитаты и связи теряются молча только если терять нечего. Иначе — окно с
    // числами и явным «Удалить и сохранить»; отказ не сохраняет ничего, то есть
    // остаются и прежний файл, и цитаты, и связи.
    if (orphaned.length) {
      setOrphanConfirm({
        payload,
        summary: getOrphanedSummary(orphaned, orphanedLines.length),
      });
      return;
    }

    commitSave(payload);
  };

  // Только функциональный setState: два ColorPicker'а ставят свои дефолты в эффектах
  // одного коммита, и обычный `{ ...form }` из замыкания терял значение первого
  // (backgroundColor у комментария оставался пустым).
  const formChangeHandler = (field, value) => {
    if (!!error) setError(null);

    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  if (Component) {
    return (
      <div
        className={`panel-inner flex flex-col h-full flex-1`}
      >
        <div className="panel-cell">
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
            {templateSettings.optionalWidgets.includes(WIDGET_HEADER) && (
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
                <div className="w-1/6">
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
                onChange={(e) =>
                  formChangeHandler(FIELD_SOURCE, e.target.value)
                }
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

          {!!error && <div className="alert alert-danger">{error.message}</div>}
        </div>
        <Component />
      </div>
    );
  }

  return (
    <>
      <div
        className={`panel-inner flex flex-col h-full flex-1`}
      >
        {!isMaximized && (
          <>
            <div className="panel-cell">
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
                <div>
                  <Switch
                    defaultChecked={true}
                    checked={!form[FIELD_DONT_SHOW_HEADER]}
                    onChange={(checked) => {
                      formChangeHandler(FIELD_DONT_SHOW_HEADER, !checked);
                    }}
                  />
                </div>
              </div>
              <div className="panel-flex mb-2">
                <div className="w-7/12">
                  <Input
                    placeholder="Source URL:"
                    data-test-id={TID.addTurn.field('source')}
                    value={form[FIELD_SOURCE]}
                    onChange={(e) =>
                      formChangeHandler(FIELD_SOURCE, e.target.value)
                    }
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
                    />
                  );
                })}
              {!!error && (
                <div className="alert alert-danger">{error.message}</div>
              )}
            </div>
          </>
        )}
        <div className="flex-1 quill-wrapper panel-cell mt-0">
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
              onClick={(e) => saveHandler(e)}
            >
              Save
            </button>
            <button
              className="btn btn-primary"
              // id="cancel-turn-modal"
              onClick={(e) => hidePanel()}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                const cleanedText = cleanText(
                  quillConstants.quill.getText(),
                );
                quillConstants.quill.setText(cleanedText);
              }}
            >
              Format
            </button>

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

      {/* Замена файла уносит цитаты старого и связи, которые на них держались
          (BP-26). Окно контролируемое, а не Modal.confirm: статические методы
          antd не видят контекст темы, а нам всё равно нужно своё состояние —
          в нём лежит уже собранное сохранение. */}
      <Modal
        open={!!orphanConfirm}
        title="Заменяется файл — цитаты будут удалены"
        okText="Удалить и сохранить"
        cancelText="Отмена"
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
            <p>
              Цитаты привязаны к содержимому файла — к его страницам, областям и
              секундам. После замены им не на что указывать, поэтому они
              удаляются вместе со связями, которые на них держались.
            </p>
            <p className="mb-0">
              Будет удалено цитат: <b>{orphanConfirm.summary.quotesCount}</b> (
              {orphanConfirm.summary.byWidget}), связей:{' '}
              <b>{orphanConfirm.summary.linesCount}</b>.
            </p>
          </>
        )}
      </Modal>
    </>
  );
};

export default AddEditTurnPopup;

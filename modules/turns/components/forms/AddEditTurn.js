import { getQuill } from '@/modules/turns/components/helpers/quillHelper';
import { useEffect, useState, useMemo } from 'react';
import turnSettings, { WIDGET_HEADER } from '@/modules/turns/settings';
import FormInput from './FormInput';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleMaximizeQuill,
  togglePanel,
} from '@/modules/panels/redux/actions';
import { PANEL_ADD_EDIT_TURN } from '@/modules/panels/settings';
import { createTurn, resaveTurn } from '../../redux/actions';
import { filterQuotesDeleted } from '@/modules/quotes/components/helpers/filters';
import { filterLinesByQuoteKeys } from '@/modules/lines/components/helpers/line';
import { linesDelete } from '@/modules/lines/redux/actions';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import DropdownTemplate from '../inputs/DropdownTemplate';
import { Button, DatePicker, Input, Switch } from 'antd';
import moment from 'moment';
import { cleanText } from '../helpers/textHelper';
import { TurnHelper } from '../../redux/helpers';

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
  const turnData = useSelector((state) => state.turns.d[editTurnId]?.data);
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

    for (let prevQuote of prevQuotes) {
      if (prevQuote.type !== TYPE_QUOTE_TEXT) {
        quotes.push(prevQuote);
      }
    }

    const quotesDeleted = filterQuotesDeleted(prevQuotes, quotes);

    const linesToDelete = filterLinesByQuoteKeys(
      lines,
      quotesDeleted.map((quote) => `${turnToEdit._id}_${quote.id}`),
    );

    if (!!quotesDeleted.length) {
      dispatch(linesDelete(linesToDelete.map((l) => l._id)));
    }

    let turnObj = {
      ...preparedForm,
      paragraph: resTextArr,
      contentType: activeTemplate,
      quotes: [...quotes],
    };

    const saveCallbacks = {
      // @todo: передавать в виджет через props
      success: () => {
        dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
        dispatch(toggleMaximizeQuill(false));
      },
    };

    if (!!turnToEdit) {
      turnObj._id = turnToEdit._id;
      turnObj.x = turnToEdit.x;
      turnObj.y = turnToEdit.y;

      // @fixme
      dispatch(resaveTurn(turnObj, saveCallbacks));
    } else {
      turnObj.height = 600;
      turnObj.width = 800;
      turnObj.x =
        gamePosition.x + Math.round(window.innerWidth / 2 - turnObj.width / 2);
      turnObj.y =
        gamePosition.y +
        Math.round(window.innerHeight / 2 - turnObj.height / 2);

      // @fixme
      dispatch(createTurn(turnObj, saveCallbacks));
    }
  };

  const formChangeHandler = (field, value) => {
    console.log('formChangeHandler');
    console.log({ form });
    if (!!error) setError(null);

    setForm({ ...form, [field]: value });
  };

  if (Component) {
    return (
      <div
        className={`panel-inner flex flex-col h-full flex-1 add-edit-form ${
          isMaximized ? 'maximized' : ''
        }`}
      >
        <div className="panel-cell">
          <div className="form-group panel-flex mb-2">
            <div className="col-sm-2">
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
                <div className="col-sm-8">
                  <Input
                    placeholder="Header:"
                    value={form[FIELD_HEADER]}
                    onChange={(e) =>
                      formChangeHandler(FIELD_HEADER, e.target.value)
                    }
                  />
                </div>
                <div className="col-sm-2">
                  <Switch
                    defaultChecked={true}
                    checked={!form[FIELD_DONT_SHOW_HEADER]}
                    onChange={(checked) => {
                      if (!!error) setError(null);
                      setForm({
                        ...form,
                        [FIELD_DONT_SHOW_HEADER]: !checked,
                      });
                    }}
                  />
                </div>
              </>
            )}
          </div>
          <div className="form-group panel-flex mb-2">
            <div className="col-sm-7">
              <Input
                placeholder="Source URL:"
                value={form[FIELD_SOURCE]}
                onChange={(e) => {
                  if (!!error) setError(null);
                  setForm({ ...form, [FIELD_SOURCE]: e.target.value });
                }}
              />
            </div>
            <div className="col-sm-3">
              <DatePicker
                value={form[FIELD_DATE] ? moment(form[FIELD_DATE]) : null}
                style={{ width: '100%' }}
                onChange={(moment) => {
                  if (!!error) setError(null);

                  setForm({
                    ...form,
                    [FIELD_DATE]: moment?.format('YYYY-MM-DD'),
                  });
                }}
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
        className={`panel-inner flex flex-col h-full flex-1 add-edit-form ${
          isMaximized ? 'maximized' : ''
        }`}
      >
        {!isMaximized && (
          <>
            <div className="panel-cell">
              <div className="form-group panel-flex mb-2">
                <div className="col-sm-2">
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
                <div className="col-sm-8">
                  <Input
                    placeholder="Header:"
                    value={form[FIELD_HEADER]}
                    onChange={(e) =>
                      formChangeHandler(FIELD_HEADER, e.target.value)
                    }
                  />
                </div>
                <div className="col-sm-2">
                  <Switch
                    defaultChecked={true}
                    checked={!form[FIELD_DONT_SHOW_HEADER]}
                    onChange={(checked) => {
                      if (!!error) setError(null);
                      setForm({
                        ...form,
                        [FIELD_DONT_SHOW_HEADER]: !checked,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="form-group panel-flex mb-2">
                <div className="col-sm-7">
                  <Input
                    placeholder="Source URL:"
                    value={form[FIELD_SOURCE]}
                    onChange={(e) => {
                      if (!!error) setError(null);
                      setForm({ ...form, [FIELD_SOURCE]: e.target.value });
                    }}
                  />
                </div>
                <div className="col-sm-3">
                  <DatePicker
                    value={form[FIELD_DATE] ? moment(form[FIELD_DATE]) : null}
                    style={{ width: '100%' }}
                    onChange={(moment) => {
                      if (!!error) setError(null);
                      setForm({
                        ...form,
                        [FIELD_DATE]: moment?.format('YYYY-MM-DD'),
                      });
                    }}
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
            </span>
          </div>
          <div id="editor-container-new" />
        </div>
        <div className="panel-cell">
          <div className="panel-flex panel-buttons">
            <button
              className="btn btn-primary btn-accent"
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
                  quillConstants.quill.editor.getText(0, Infinity),
                );
                quillConstants.quill.setText(cleanedText);
                console.log({ cleanedText });
                console.log(quillConstants.quill.editor);
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
    </>
  );
};

export default AddEditTurnPopup;

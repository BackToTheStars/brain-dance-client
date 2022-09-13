import { getQuill } from '@/modules/turns/components/helpers/quillHelper';
import { useEffect, useState } from 'react';
import turnSettings from '@/modules/turns/settings';
import FormInput from './FormInput';
import { useDispatch, useSelector } from 'react-redux';
import { togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_ADD_EDIT_TURN } from '@/modules/panels/settings';
import { createTurn, resaveTurn } from '../../redux/actions';
import { filterQuotesDeleted } from '@/modules/quotes/components/helpers/filters';
import { filterLinesByQuoteKeys } from '@/modules/lines/components/helpers/line';
import { linesDelete } from '@/modules/lines/redux/actions';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import DropdownTemplate from '../inputs/DropdownTemplate';
import { Button, DatePicker, Input, Switch } from 'antd';
import moment from 'moment';

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
    '0'
  )}-${String(d.getDay()).padStart(2, '0')}`;
};

const AddEditTurnPopup = () => {
  // https://transform.tools/html-to-jsx   - преобразователь HTML в JSX
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const turnToEdit = useSelector((state) => state.turns.d[editTurnId]);
  const zeroPointId = useSelector((state) => state.turns.zeroPointId);
  const zeroPoint = useSelector((state) => state.turns.d[zeroPointId]);

  const [quillConstants, setQuillConstants] = useState({}); // { quill, getQuillTextArr }
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATE_PICTURE);
  const [error, setError] = useState(null);
  const availableFields = settings[activeTemplate].availableFields;
  const requiredFields = settings[activeTemplate].requiredFields || [];
  const requiredParagraph = settings[activeTemplate].requiredParagraph || false;
  const [form, setForm] = useState({});

  const dispatch = useDispatch();
  const hidePanel = () => dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
  const lines = useSelector((state) => state.lines.lines);

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
        // quill.setContents(turnToEdit.paragraph);
        quill.setContents(turnToEdit.paragraph);
        // console.log(' quill.getLine(0).value()', quill.getLine(0).value());
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
      getQuill('#editor-container-new', '#toolbar-container-new')
    );
  }, []);

  const saveHandler = (e) => {
    e.preventDefault(); // почитать про preventDefault()
    const textArr = quillConstants.getQuillTextArr();

    let incId = Math.floor(new Date().getTime() / 1000);

    const resTextArr = [];
    let i = 0;
    // const paragraphQuotes =
    //   turnToEdit && turnToEdit.quotes
    //     ? turnToEdit.quotes.filter((quote) => quote.type === 'text')
    //     : [];
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
      quotesDeleted.map((quote) => `${turnToEdit._id}_${quote.id}`)
    );

    if (!!quotesDeleted.length) {
      dispatch(linesDelete(linesToDelete.map((l) => l._id)));
    }

    let turnObj = {
      ...preparedForm,
      paragraph: resTextArr,
      contentType: activeTemplate,
      quotes: [
        ...quotes,
        // ...prevQuotes.filter((quote) => quote.type === 'picture'), // добавляем отдельно цитаты картинки
      ],
    };

    const saveCallbacks = {
      // @todo: передавать в виджет через props
      success: () => dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN })),
    };

    if (!!turnToEdit) {
      turnObj._id = turnToEdit._id;
      turnObj.x = -zeroPoint.x + turnToEdit.x;
      turnObj.y = -zeroPoint.y + turnToEdit.y;

      dispatch(resaveTurn(turnObj, zeroPoint, saveCallbacks));
    } else {
      turnObj.height = 600;
      turnObj.width = 800;
      turnObj.x =
        -zeroPoint.x + Math.round(window.innerWidth / 2 - turnObj.width / 2);
      turnObj.y =
        -zeroPoint.y + Math.round(window.innerHeight / 2 - turnObj.height / 2);

      dispatch(createTurn(turnObj, zeroPoint, saveCallbacks));
    }
  };

  console.log({ form });
  // console.log(form[FIELD_DATE], moment(form[FIELD_DATE]?.value));

  return (
    <>
      <div className="panel-inner d-flex flex-column h-100 flex-1">
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
                onChange={(e) => {
                  if (!!error) setError(null);
                  setForm({ ...form, [FIELD_HEADER]: e.target.value });
                }}
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
          {/* <input type="hidden" id="idInput" /> */}
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
                value={form[FIELD_DATE] ? moment(form[FIELD_DATE]) : moment()}
                style={{ width: '100%' }}
                onChange={(moment) => {
                  if (!!error) setError(null);
                  console.log(moment.format('YYYY-MM-DD'));
                  setForm({
                    ...form,
                    [FIELD_DATE]: moment.format('YYYY-MM-DD'),
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
                  changeHandler={(value) => {
                    if (!!error) setError(null);
                    setForm({ ...form, [field]: value });
                  }}
                  label={fieldSettings[field].label}
                  prefixClass={fieldSettings[field].prefixClass}
                  inputType={fieldSettings[field].inputType}
                  key={field}
                  value={form[field] || ''}
                  widgetSettings={fieldSettings[field].widgetSettings}
                />
              );
            })}
          {!!error && <div className="alert alert-danger">{error.message}</div>}
        </div>

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
          {/* class="h-85"> */}
        </div>
        <div className="panel-cell">
          <div className="panel-flex panel-buttons">
            <button className="btn btn-primary" onClick={(e) => saveHandler(e)}>
              Save
            </button>
            <button
              className="btn btn-primary"
              // id="cancel-turn-modal"
              onClick={(e) => hidePanel()}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEditTurnPopup;

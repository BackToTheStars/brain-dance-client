import { useEffect, useState } from 'react';
import { getQuill } from '../helpers/quillHandler';
import { useUiContext } from '../contexts/UI_Context';
import {
  useTurnContext,
  ACTION_TURN_CREATED,
  ACTION_TURN_WAS_CHANGED,
} from '../contexts/TurnContext';
import turnSettings from '../turn/settings';

const {
  settings,
  templatesToShow,
  fieldSettings,
  fieldsToShow,
  TEMPLATE_PICTURE,
} = turnSettings;

const AddEditTurnPopup = () => {
  // https://transform.tools/html-to-jsx   - преобразователь HTML в JSX

  const [quillConstants, setQuillConstants] = useState({}); // { quill, getQuillTextArr }
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATE_PICTURE);
  const [error, setError] = useState(null);
  const availableFields = settings[activeTemplate].availableFields;
  const requiredFields = settings[activeTemplate].requiredFields || [];
  const requiredParagraph = settings[activeTemplate].requiredParagraph || false;
  const [form, setForm] = useState({});
  const { createTurn, turns, dispatch, turnToEdit, updateTurn } =
    useTurnContext();
  const {
    minimapState: { left, top },
    createEditTurnPopupIsHidden,
    setCreateEditTurnPopupIsHidden,
  } = useUiContext();

  useEffect(() => {
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
        setTimeout(() => {
          const spans = document.querySelectorAll('.ql-editor span');
          let i = 1;
          for (let span of spans) {
            span.setAttribute('id', (i += 1));
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
  }, [turnToEdit]);

  useEffect(() => {
    setQuillConstants(
      getQuill('#editor-container-new', '#toolbar-container-new')
    );
  }, []);

  const saveHandler = (e) => {
    e.preventDefault(); // почитать про preventDefault()
    const textArr = quillConstants.getQuillTextArr();
    const zeroPoint = turns.find((turn) => turn.contentType === 'zero-point');
    const { x: zeroPointX, y: zeroPointY } = zeroPoint;

    // const viewportHeight = window ? window.innerHeight : 1600;
    // const viewportWidth = window ? window.innerWidth : 1200;

    // const widthK = 0.3; // коэффициент ширины вокруг мини-карты

    // const freeSpaceTopBottom = Math.floor(viewportHeight * widthK);
    // const freeSpaceLeftRight = Math.floor(viewportWidth * widthK);

    let incId = Math.floor(new Date().getTime() / 1000);

    const resTextArr = [];
    let i = 0;
    for (let textItem of textArr) {
      if (!textItem.attributes || !textItem.attributes.background) {
        resTextArr.push(textItem);
        continue;
      }
      const quoteId =
        !!turnToEdit && turnToEdit.quotes[i]
          ? turnToEdit.quotes[i].id
          : (incId += 1);
      i += 1;
      resTextArr.push({
        ...textItem,
        attributes: {
          ...textItem.attributes,
          id: quoteId,
          // id: textItem.attributes.id || (incId += 1),
          // id: 'quote-' + (textItem.attributes.id || (incId += 1)),
        },
      });
    }

    const quotes = [];

    console.log(resTextArr);

    for (let textItem of resTextArr) {
      if (textItem.attributes && textItem.attributes.id) {
        quotes.push({
          id: textItem.attributes.id,
          text: textItem.insert,
        });
      }
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

    let turnObj = {
      ...preparedForm,
      // height: 500,
      // width: 500,

      // x: -left + freeSpaceLeftRight + 50,
      // y: -top + freeSpaceTopBottom + 50,
      paragraph: resTextArr,
      contentType: activeTemplate,
      quotes,
    };

    // if (!turnToEdit) {
    //   turnObj.height = 600;
    //   turnObj.width = 800;
    // }

    if (!!turnToEdit) {
      turnObj.x = -zeroPointX + turnToEdit.x;
      turnObj.y = -zeroPointY + turnToEdit.y;
      const prevQuotes = turnToEdit.quotes; // цитаты, которые пришли из базы данных

      if (prevQuotes.length > quotes.length) {
        const deletedQuotes = prevQuotes.slice(quotes.length);
        // @todo: удалить связи, которые содержат эти цитаты
      }

      // const quoteIds = quotes.map((quote) => +quote.id); // map в любом случае возвращает массив
      // const quoteIdsToDelete = prevQuotes
      //   .filter((quote) => {
      //     return !quoteIds.includes(+quote.id); // + это то же самое что parseFloat
      //   })
      //   .map((quote) => quote.id);

      updateTurn(turnToEdit._id, turnObj, {
        successCallback: (data) => {
          setCreateEditTurnPopupIsHidden(true); // закрыть popup
          dispatch({
            type: ACTION_TURN_WAS_CHANGED,
            payload: {
              ...data.item,
              x: data.item.x + zeroPointX,
              y: data.item.y + zeroPointY,
            },
          });
        },
        errorCallback: (message) => {
          setError({ message });
        },
      });
    } else {
      turnObj.height = 600;
      turnObj.width = 800;
      createTurn(turnObj, {
        successCallback: () => {
          setCreateEditTurnPopupIsHidden(true);
        },
        errorCallback: (message) => {
          setError({ message });
        },
      });
      // turnObj.height = 600;
      // turnObj.width = 800;
      // turnObj.x = -zeroPointX + Math.floor(window.innerWidth / 2) - 250;
      // turnObj.y = -zeroPointY + Math.floor(window.innerHeight / 2) - 250;
      // // создать шаг, закрыть модальное окно
      // createTurn(turnObj, {
      //   successCallback: (data) => {
      //     // console.log('успешный коллбэк на уровне Попапа');
      //     setCreateEditTurnPopupIsHidden(true);
      //     dispatch({
      //       type: ACTION_TURN_CREATED,
      //       payload: {
      //         ...data.item,
      //         x: data.item.x + zeroPointX,
      //         y: data.item.y + zeroPointY,
      //       },
      //     });
      //   },
      //   errorCallback: (message) => {
      //     setError({ message });
      //   },
      // });
    }
  };

  return (
    <div
      id="modalBackground"
      style={{ display: createEditTurnPopupIsHidden ? 'none' : 'block' }}
    >
      <div id="modal" className="container">
        <div className="row my-4 flex-1">
          <div className="col-8 quill-wrapper">
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
          <div className="col-4">
            <div className="radio-group">
              {templatesToShow.map((el) => {
                const templateSettings = settings[el];
                return (
                  <div className="form-group row" key={el}>
                    <input
                      type="radio"
                      name="template"
                      value={templateSettings.value}
                      checked={activeTemplate === el}
                      onChange={(e) => {
                        setActiveTemplate(el);
                        setError(null);
                      }}
                    />
                    <span>{templateSettings.label}</span>
                  </div>
                );
              })}
            </div>
            <input type="hidden" id="idInput" />

            {fieldsToShow
              .filter((field) => {
                if (!fieldSettings[field].special) {
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
            {!!error && (
              <div className="alert alert-danger">{error.message}</div>
            )}
          </div>
        </div>
        <div className="row mb-4">
          <div className="col">
            <button onClick={(e) => saveHandler(e)}>Save</button>
            <button
              id="cancel-turn-modal"
              onClick={(e) => setCreateEditTurnPopupIsHidden(true)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorPicker = ({ value, changeHandler, widgetSettings }) => {
  // @todo: проверить, почему настройки по умолчанию устанавливаются только
  // для последнего ColorPicker
  useEffect(() => {
    if (!!widgetSettings.defaultColor && !value) {
      console.log(widgetSettings.defaultColor);
      changeHandler(widgetSettings.defaultColor);
    }
  }, [widgetSettings.defaultColor]);

  return (
    <div className="color-picker-widget">
      {widgetSettings.colors.map((color, index) => (
        <div
          key={index}
          className={`color-picker-square ${value === color ? 'active' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => changeHandler(color)}
        />
      ))}
    </div>
  );
};

const FormInput = ({
  label,
  prefixClass,
  inputType = 'text',
  changeHandler = () => {},
  value,
  widgetSettings = {},
}) => {
  return (
    <div className={`form-group row ${prefixClass}-row`}>
      <label className="col-sm-3 col-form-label">{label}</label>
      <div className="col-sm-9">
        {inputType === 'color-picker' ? (
          <ColorPicker
            value={value}
            changeHandler={changeHandler}
            widgetSettings={widgetSettings}
          />
        ) : (
          <input
            type={inputType}
            className="form-control"
            value={value}
            onChange={(e) =>
              changeHandler(
                inputType === 'checkbox' ? e.target.checked : e.target.value
              )
            }
            checked={inputType === 'checkbox' && value}
          />
        )}
      </div>
    </div>
  );
};

export default AddEditTurnPopup;

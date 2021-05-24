import { useEffect, useState } from 'react';
import { getQuill } from '../helpers/quillHandler';
import { useUiContext } from '../contexts/UI_Context';
import { useTurnContext, ACTION_TURN_CREATED } from '../contexts/TurnContext';
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
  const [form, setForm] = useState({});
  const { createTurn, turns, dispatch } = useTurnContext();
  // console.log('AddEditTurnPopup');
  // console.log({ turns });

  const {
    minimapState: { left, top },
    createEditTurnPopupIsHidden,
    setCreateEditTurnPopupIsHidden,
  } = useUiContext();

  useEffect(() => {
    setQuillConstants(
      getQuill('#editor-container-new', '#toolbar-container-new')
    );
  }, []);

  const saveHandler = (e) => {
    e.preventDefault(); // почитать про preventDefault()
    console.log(form);
    const textArr = quillConstants.getQuillTextArr();
    const zeroPoint = turns.find((turn) => turn.contentType === 'zero-point');
    const { x: zeroPointX, y: zeroPointY } = zeroPoint;

    // const viewportHeight = window ? window.innerHeight : 1600;
    // const viewportWidth = window ? window.innerWidth : 1200;

    // const widthK = 0.3; // коэффициент ширины вокруг мини-карты

    // const freeSpaceTopBottom = Math.floor(viewportHeight * widthK);
    // const freeSpaceLeftRight = Math.floor(viewportWidth * widthK);

    let incId = Math.floor(new Date().getTime() / 1000);

    const resTextArr = textArr.map((textItem) => {
      if (!textItem.attributes || !textItem.attributes.background) {
        return textItem;
      }
      return {
        ...textItem,
        attributes: {
          ...textItem.attributes,
          id: textItem.attributes.id || `quote-${(incId += 1)}`,
          // id: 'quote-' + (textItem.attributes.id || (incId += 1)),
        },
      };
    });

    const quotes = [];

    for (let textItem of resTextArr) {
      if (textItem.attributes && textItem.attributes.id) {
        quotes.push({
          id: textItem.attributes.id,
        });
      }
    }

    let turnObj = {
      ...form,
      height: 500,
      width: 500,
      x: -zeroPointX + Math.floor(window.innerWidth / 2) - 250,
      y: -zeroPointY + Math.floor(window.innerHeight / 2) - 250,
      // x: -left + freeSpaceLeftRight + 50,
      // y: -top + freeSpaceTopBottom + 50,
      paragraph: resTextArr,
      contentType: activeTemplate,
      quotes,
    };
    // создать шаг, закрыть модальное окно
    createTurn(turnObj, {
      successCallback: (data) => {
        // console.log('успешный коллбэк на уровне Попапа');
        setCreateEditTurnPopupIsHidden(true);
        dispatch({
          type: ACTION_TURN_CREATED,
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
                      defaultChecked={activeTemplate === el}
                      onChange={(e) => {
                        setActiveTemplate(el);
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

const FormInput = ({
  label,
  prefixClass,
  inputType = 'text',
  changeHandler = () => {},
  value,
}) => {
  return (
    <div className={`form-group row ${prefixClass}-row`}>
      <label className="col-sm-3 col-form-label">{label}</label>
      <div className="col-sm-9">
        <input
          type={inputType}
          className="form-control"
          value={value}
          onChange={(e) => changeHandler(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AddEditTurnPopup;

import { useEffect, useState } from 'react';
import { getQuill } from '../helpers/quillHandler';
import { useUiContext } from '../contexts/UI_Context';
import { useTurnContext } from '../contexts/TurnContext';

const TEMPLATE_PICTURE = 1;
const TEMPLATE_VIDEO = 2;
const TEMPLATE_COMMENT = 3;
const TEMPLATE_MIXED = 4;
const TEMPLATE_PDF = 5;
const TEMPLATE_AUDIO = 6;
const TEMPLATE_CAROUSEL = 7;
const TEMPLATE_NEWS = 8;

const FIELD_HEADER = 'header';
const FIELD_PICTURE = 'imageUrl';
const FIELD_VIDEO = 'videoUrl';
const FIELD_DATE = 'date';
const FIELD_SOURCE = 'sourceUrl';

const settings = {
  [TEMPLATE_PICTURE]: {
    availableFields: [FIELD_PICTURE],
    value: 'picture',
    label: 'Text / picture',
  },
  [TEMPLATE_VIDEO]: {
    availableFields: [FIELD_VIDEO],
    value: 'video',
    label: 'Text / video',
  },
  [TEMPLATE_COMMENT]: {
    availableFields: [],
    value: 'comment',
    label: 'Comment',
  },
};

const templatesToShow = [TEMPLATE_PICTURE, TEMPLATE_VIDEO, TEMPLATE_COMMENT];

const fieldSettings = {
  [FIELD_HEADER]: {
    label: 'Header',
    prefixClass: 'header',
  },
  [FIELD_PICTURE]: {
    label: 'Image Url',
    prefixClass: 'image-url',
    special: true,
  },
  [FIELD_VIDEO]: {
    label: 'Video Url',
    prefixClass: 'video-url',
    special: true,
  },
  [FIELD_DATE]: {
    label: 'Date',
    prefixClass: 'date',
    inputType: 'date',
  },
  [FIELD_SOURCE]: {
    label: 'Source Url',
    prefixClass: 'source-url',
  },
};

const fieldsToShow = Object.keys(fieldSettings); // возвращает массив строк-ключей объекта

const AddEditTurnPopup = () => {
  // https://transform.tools/html-to-jsx   - преобразователь HTML в JSX

  const [quillConstants, setQuillConstants] = useState({}); // { quill, getQuillTextArr }
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATE_PICTURE);
  const availableFields = settings[activeTemplate].availableFields;
  console.log({ activeTemplate, availableFields });
  const [form, setForm] = useState({});
  const { createTurn } = useTurnContext();

  const {
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
    let turnObj = {
      ...form,
      paragraph: textArr,
    };
    // создать шаг, закрыть модальное окно
    createTurn(turnObj);
    setCreateEditTurnPopupIsHidden(true);
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

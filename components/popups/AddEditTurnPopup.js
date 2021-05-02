import { useEffect, useState } from 'react';
import { getQuill } from '../helpers/quillHandler';
import { useUiContext } from '../contexts/UI_Context';

const AddEditTurnPopup = () => {
  // https://transform.tools/html-to-jsx   - преобразователь HTML в JSX

  const [quillConstants, setQuillConstants] = useState({}); // { quill, getQuillTextArr }

  const {
    createEditTurnPopupIsHidden,
    setCreateEditTurnPopupIsHidden,
  } = useUiContext();

  useEffect(() => {
    setQuillConstants(
      getQuill('#editor-container-new', '#toolbar-container-new')
    );
  }, []);

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
              <div className="form-group row">
                <input
                  type="radio"
                  name="type"
                  defaultValue="picture"
                  defaultChecked
                />
                <span>Text / picture</span>
              </div>
              <div className="form-group row">
                <input type="radio" name="type" defaultValue="video" />
                <span>Text / video</span>
              </div>
              <div className="form-group row">
                <input type="radio" name="type" defaultValue="comment" />
                <span>Comment</span>
              </div>
            </div>
            <input type="hidden" id="idInput" />

            <FormInput label="Header" prefixClass="header" />
            <FormInput label="Date" prefixClass="date" inputType="date" />
            <FormInput label="Source Url" prefixClass="source-url" />
            <FormInput label="Image Url" prefixClass="image-url" />
            <FormInput label="Video Url" prefixClass="video-url" />
          </div>
        </div>
        <div className="row mb-4">
          <div className="col">
            <button id="save-turn-modal">Save</button>
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

const FormInput = ({ label, prefixClass, inputType = 'text' }) => {
  return (
    <div className={`form-group row ${prefixClass}-row`}>
      <label className="col-sm-3 col-form-label">{label}</label>
      <div className="col-sm-9">
        <input type={inputType} className="form-control" />
      </div>
    </div>
  );
};

export default AddEditTurnPopup;

import { useState } from 'react';

const AddEditTurnPopup = () => {
  // https://transform.tools/html-to-jsx   - преобразователь HTML в JSX

  return (
    <div id="modalBackground">
      <div id="modal" className="container">
        <div className="row my-4 flex-1">
          <div className="col-8 quill-wrapper">
            <div id="toolbar-container">
              <span className="ql-formats">
                <select className="ql-background">
                  <option selected />
                  <option value="rgb(255, 255, 0)" />
                  <option value="rgb(138, 255, 36)" />
                  <option value="rgb(253, 201, 255)" />
                  <option value="rgb(156, 245, 255)" />
                  <option value="rgb(210, 211, 212)" />
                  <option value="rgb(255, 213, 150)" />
                </select>
              </span>
            </div>
            <div id="editor-container" />
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
            <button id="cancel-turn-modal">Cancel</button>
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

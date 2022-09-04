import ColorPicker from './ColorPicker';
const FormInput = ({
  label,
  prefixClass,
  inputType = 'text',
  changeHandler = () => {},
  value,
  widgetSettings = {},
}) => {
  return (
    <div className={`form-group row ${prefixClass}-row mb-3`}>
      <label className="col-sm-3 col-form-label">{label}</label>
      <div className="col-sm-9">
        {inputType === 'color-picker' && (
          <ColorPicker
            value={value}
            changeHandler={changeHandler}
            widgetSettings={widgetSettings}
          />
        )}
        {inputType === 'component' &&
          widgetSettings.render({ changeHandler, label, prefixClass, value })}
        {!['color-picker', 'component'].includes(inputType) && (
          <input
            type={inputType}
            className={
              inputType === 'checkbox' ? 'form-check-input' : 'form-control'
            }
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

export default FormInput;

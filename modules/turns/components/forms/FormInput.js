import { Tooltip } from 'antd';
import ColorPicker from './ColorPicker';
const FormInput = ({
  label,
  prefixClass,
  inputType = 'text',
  changeHandler = () => {},
  value,
  widgetSettings = {},
  form,
}) => {
  return (
    <div className={`form-group row ${prefixClass}-row mb-2`}>
      <div className="col-sm-9">
        {inputType === 'component' &&
          widgetSettings.render({
            form,
            changeHandler,
            label,
            prefixClass,
            value,
          })}
        {inputType === 'color-picker' && (
          <Tooltip title={label}>
            <ColorPicker
              value={value}
              changeHandler={changeHandler}
              widgetSettings={widgetSettings}
            />
          </Tooltip>
        )}
        {!['color-picker', 'component'].includes(inputType) && (
          <Tooltip title={label}>
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
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default FormInput;

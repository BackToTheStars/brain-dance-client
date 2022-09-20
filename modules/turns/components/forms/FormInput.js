import { Input, Tooltip } from 'antd';
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
      <div className="col-sm-10" style={{ width: '770px', maxWidth: '100%' }}>
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
              label={label}
            />
          </Tooltip>
        )}
        {inputType === 'text' && (
          <Input
            value={value}
            onChange={(e) => changeHandler(e.target.value)}
            placeholder={`${label}:`}
          />
        )}
        {!['color-picker', 'component', 'text'].includes(inputType) && (
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

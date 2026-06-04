import { Input, Tooltip } from 'antd';
import ColorPicker from './ColorPicker';
import { TID } from '@/config/testIds';
const FormInput = ({
  label,
  prefixClass,
  inputType = 'text',
  changeHandler = () => {},
  value,
  widgetSettings = {},
  form,
}) => {
  const testId = prefixClass ? TID.addTurn.field(prefixClass) : undefined;
  return (
    <div className={`row ${prefixClass}-row mb-2`}>
      <div className="w-5/6" style={{ width: '745px', maxWidth: '100%' }}>
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
            data-test-id={testId}
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
              data-test-id={testId}
              onChange={(e) =>
                changeHandler(
                  inputType === 'checkbox' ? e.target.checked : e.target.value,
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

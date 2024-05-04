import { useEffect } from 'react';

const ColorPicker = ({ value, changeHandler, widgetSettings, label }) => {
  // @todo: проверить, почему настройки по умолчанию устанавливаются только
  // для последнего ColorPicker
  useEffect(() => {
    if (!!widgetSettings.defaultColor && !value) {
      console.log(widgetSettings.defaultColor);
      changeHandler(widgetSettings.defaultColor);
    }
  }, [widgetSettings.defaultColor]);

  return (
    <div className="flex align-items-center">
      <label className="me-2" style={{ fontSize: '16px', width: '95px' }}>
        {label}:
      </label>
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
    </div>
  );
};

export default ColorPicker;

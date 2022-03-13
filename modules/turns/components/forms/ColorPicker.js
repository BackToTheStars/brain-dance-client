import { useEffect } from "react";

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

export default ColorPicker;
import { useEffect } from 'react';

const ColorPicker = ({ value, changeHandler, widgetSettings, label }) => {
  // дефолт ставится в эффекте на монтировании; оба ColorPicker'а формы делают это в
  // одном коммите, поэтому formChangeHandler обязан быть функциональным setState —
  // иначе второй вызов затирает первый (было: у комментария не сохранялся фон)
  useEffect(() => {
    if (!!widgetSettings.defaultColor && !value) {
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

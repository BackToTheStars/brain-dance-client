import { Slider } from "antd";

export const VerticalMiniSlider = ({
  setShowSlider,
  value,
  setValue,
  min = 0,
  max = 100,
  step = undefined,
}) => {
  return (
    <div
      className="vertical-mini-slider not-draggable"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <div className="slider-container">
        <Slider
          vertical
          value={value}
          onChange={setValue}
          min={min}
          max={max}
          tooltip={{
            open: false,
          }}
          step={step}
        />
      </div>
    </div>
  );
};

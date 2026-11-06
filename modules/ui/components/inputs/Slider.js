import { Slider } from "antd";

export const VerticalMiniSlider = ({
  setShowSlider,
  value,
  setValue,
  min = 0,
  max = 100,
  step = undefined,
  className = '',
  testId = undefined,
  before = null,
  after = null,
}) => {
  return (
    <div
      className={`vertical-mini-slider not-draggable ${className}`.trim()}
      data-test-id={testId}
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {before}
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
      {after}
    </div>
  );
};

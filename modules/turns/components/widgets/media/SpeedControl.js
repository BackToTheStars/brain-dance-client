import { useState } from 'react';
import { VerticalMiniSlider } from '@/modules/ui/components/inputs/Slider';
import { TID } from '@/config/testIds';

// Щелчок переключает 1 ↔ 2 и помнит прежнюю скорость, наведение открывает ползунок с шагом 0,1.
// У видео верх 2: YouTube быстрее не играет. `up` — ползунок над кнопкой (панель видео внизу плеера).
const STEP = 0.1;

export const SpeedControl = ({
  speed,
  setSpeed,
  min = 0.5,
  max = 2.5,
  up = false,
  buttonClassName = '',
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const [previousSpeed, setPreviousSpeed] = useState(null);
  const stepBy = (delta) =>
    setSpeed(Math.min(max, Math.max(min, Math.round((speed + delta) * 10) / 10)));
  const switchSpeed = () => {
    if (!previousSpeed) {
      if (speed === 1) {
        setPreviousSpeed(1);
        setSpeed(2);
      } else {
        setPreviousSpeed(speed);
        setSpeed(1);
      }
    } else {
      if (speed === previousSpeed) {
        setPreviousSpeed(speed);
        setSpeed(speed === 1 ? 2 : 1);
      } else {
        setPreviousSpeed(speed);
        setSpeed(previousSpeed);
      }
    }
  };
  return (
    <div
      className="speed-control"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        className={`speed-button ${buttonClassName}`.trim()}
        data-test-id={TID.media.speed}
        onClick={switchSpeed}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        {speed.toFixed(1)}x
      </button>
      {showSlider && (
        <VerticalMiniSlider
          setShowSlider={setShowSlider}
          value={speed}
          setValue={setSpeed}
          min={min}
          max={max}
          step={0.1}
          className={`speed-slider${up ? ' vertical-mini-slider_up' : ''}`}
          testId={TID.media.speedSlider}
          before={
            <button
              className="speed-step"
              data-test-id={TID.media.speedUp}
              disabled={speed >= max}
              onClick={() => stepBy(STEP)}
            >
              +
            </button>
          }
          after={
            <button
              className="speed-step"
              data-test-id={TID.media.speedDown}
              disabled={speed <= min}
              onClick={() => stepBy(-STEP)}
            >
              −
            </button>
          }
        />
      )}
    </div>
  );
};

export default SpeedControl;

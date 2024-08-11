import { VerticalMiniSlider } from "@/modules/ui/components/inputs/Slider";
import { useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";

export const VolumeControl = ({ volume, setVolume, muted, setMuted }) => {
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div
      className="volume-control"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        className="volume-button"
        onClick={() => setMuted(!muted)}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        {muted ? <FiVolumeX /> : <FiVolume2 />}
      </button>
      {showSlider && (
        <VerticalMiniSlider
          setShowSlider={setShowSlider}
          value={muted ? 0 : volume}
          setValue={setVolume}
        />
      )}
    </div>
  );
};

export const SpeedControl = ({ speed, setSpeed }) => {
  const [showSlider, setShowSlider] = useState(false);
  const [previousSpeed, setPreviousSpeed] = useState(null);
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
        className="speed-button"
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
          min={0.5}
          max={2.5}
          step={0.1}
        />
      )}
    </div>
  );
};

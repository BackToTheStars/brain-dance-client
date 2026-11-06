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

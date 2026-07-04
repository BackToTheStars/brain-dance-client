import { Slider } from 'antd';
import { useState } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

// Контролы горизонтальной панели видеоплеера (Media.js).
// У аудио свой дизайн (hover-попапы) — см. ../audio/Control.js и бэклог
// docs/backlog.md «Унификация UI-контролов».

export const VolumeControl = ({ volume, setVolume, muted, setMuted }) => {
  return (
    <div className="volume-control">
      <button
        className="icon-button volume-button"
        onClick={() => setMuted(!muted)}
      >
        {muted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
      </button>
      <Slider
        className="volume-slider"
        min={0}
        max={100}
        value={muted ? 0 : volume}
        onChange={setVolume}
        tooltip={{
          open: false,
        }}
      />
    </div>
  );
};

export const SpeedControl = ({ speed, setSpeed }) => {
  const [open, setOpen] = useState(false);
  const speeds = [0.5, 1, 1.5, 2];

  return (
    <div className="speed-control">
      <button className="icon-button" onClick={() => setOpen(!open)}>
        {speed}x
      </button>
      {open && (
        <div className="speed-menu">
          {speeds.map((s) => (
            <div
              key={s}
              onClick={() => {
                setSpeed(s);
                setOpen(false);
              }}
            >
              {s}x
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

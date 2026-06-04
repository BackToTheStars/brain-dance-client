import { Slider } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiEdit,
} from 'react-icons/fi';
// import { SpeedControl, VolumeControl } from './Control';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useDispatch } from 'react-redux';
import { MODE_WIDGET_VIDEO } from '@/config/panel';
import { setPanelMode } from '@/modules/panels/redux/actions';

const VolumeControl = ({ volume, setVolume, muted, setMuted }) => {
  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <div className="volume-control">
      <button className="icon-button volume-button" onClick={toggleMute}>
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

const SpeedControl = ({ speed, setSpeed }) => {
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
            <div key={s} onClick={() => setSpeed(s)}>
              {s}x
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MediaVideo = ({ videoUrl, turnId, widgetId }) => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const fsRef = useRef(null);
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const toggleMute = (val) => {
    setMuted(val);
  };

  const handleVolumeChange = (value) => {
    setVolume(value / 100);
    setMuted(value === 0);
  };

  const onTimeUpdate = (e) => {
    setProgress(e.currentTarget.currentTime);
  };

  const onDurationChange = (e) => {
    setDuration(e.currentTarget.duration || 0);
  };

  const handleSeek = (value) => {
    if (playerRef.current) playerRef.current.currentTime = value;
    setProgress(value);
  };

  const toggleFullscreen = () => {
    const playerDiv = fsRef.current;
    // playerRef.current
    // .getInternalPlayer()
    // .closest('.video-player-wrapper');
    if (!document.fullscreenElement) {
      playerDiv.requestFullscreen().catch((err) => {
        console.error(err);
      });
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <>
      <div
        className="video-player-wrapper not-draggable cursor-auto"
        ref={fsRef}
      >
        <ReactPlayer
          ref={playerRef}
          src={videoUrl}
          playing={playing}
          muted={muted}
          volume={volume}
          onTimeUpdate={onTimeUpdate}
          onDurationChange={onDurationChange}
          width="100%"
          height="100%"
          playbackRate={speed}
          controls={false}
        />
        <div className="video-controls">
          {/* Таймлайн */}
          <Slider
            className="timeline-slider"
            min={0}
            max={duration}
            value={progress}
            onChange={handleSeek}
            tooltip={{
              formatter: (value) => getFormattedDuration(value),
            }}
          />
          {/* Элементы управления */}
          <div className="controls-row">
            <button className="icon-button play-button" onClick={togglePlay}>
              {playing ? <FiPause /> : <FiPlay />}
            </button>
            <VolumeControl
              volume={volume * 100}
              setVolume={handleVolumeChange}
              muted={muted}
              setMuted={toggleMute}
            />
            <span className="video-time">
              {getFormattedDuration(progress)} /{' '}
              {getFormattedDuration(duration)}
            </span>
            <div className="flex-1" />
            {can(RULE_TURNS_CRUD) && duration
              && false // TODO: пока нет возможности редактировать цитаты медиа
              && (
              <button
                className="icon-button"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(
                    setPanelMode({
                      mode: MODE_WIDGET_VIDEO,
                      params: {
                        editTurnId: turnId,
                        editWidgetId: widgetId,
                        duration,
                      },
                    }),
                  );
                }}
              >
                <FiEdit />
              </button>
            )}
            <SpeedControl speed={speed} setSpeed={setSpeed} />
            <button
              className="icon-button fullscreen-button"
              onClick={toggleFullscreen}
            >
              {fullscreen ? <FiMinimize /> : <FiMaximize />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaVideo;

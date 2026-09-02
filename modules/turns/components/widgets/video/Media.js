import { Slider } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  FiPlay,
  FiPause,
  FiMaximize,
  FiMinimize,
  FiEdit,
} from 'react-icons/fi';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useDispatch } from 'react-redux';
import { MODE_WIDGET_VIDEO } from '@/config/panel';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { useMediaPlayback } from '../media/useMediaPlayback';
import { VolumeControl, SpeedControl } from './Controls';
import { TID } from '@/config/testIds';

const MediaVideo = ({ videoUrl, turnId, widgetId }) => {
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const fsRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const {
    playerRef,
    playing,
    togglePlay,
    progress,
    duration,
    muted,
    setMuted,
    volume,
    handleVolumeChange,
    speed,
    setSpeed,
    seek,
    onTimeUpdate,
    onDurationChange,
    onPlay,
    onPause,
    onEnded,
  } = useMediaPlayback(widgetId, turnId);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fsRef.current.requestFullscreen().catch((err) => {
        console.error(err);
      });
    } else {
      document.exitFullscreen();
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
    <div
      className="video-player-wrapper not-draggable cursor-auto"
      ref={fsRef}
      data-test-id={TID.media.player}
      data-turn-id={turnId}
      data-widget-id={widgetId}
      data-playing={playing ? 'true' : 'false'}
    >
      <ReactPlayer
        ref={playerRef}
        src={videoUrl}
        playing={playing}
        muted={muted}
        volume={volume}
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
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
          onChange={seek}
          tooltip={{
            formatter: (value) => getFormattedDuration(value),
          }}
        />
        {/* Элементы управления */}
        <div className="controls-row">
          <button
            className="icon-button play-button"
            data-test-id={TID.media.play}
            onClick={togglePlay}
          >
            {playing ? <FiPause /> : <FiPlay />}
          </button>
          <VolumeControl
            volume={volume * 100}
            setVolume={handleVolumeChange}
            muted={muted}
            setMuted={setMuted}
          />
          <span className="video-time">
            {getFormattedDuration(progress)} /{' '}
            {getFormattedDuration(duration)}
          </span>
          <div className="flex-1" />
          {can(RULE_TURNS_CRUD) && duration > 0
            && false // TODO: пока нет возможности редактировать цитаты медиа (см. docs/backlog.md)
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
  );
};

export default MediaVideo;

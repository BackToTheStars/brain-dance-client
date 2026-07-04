import { Slider } from 'antd';
import { useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlay, FiPause, FiEdit } from 'react-icons/fi';
import { WIDGET_AUDIO } from '@/modules/turns/settings';
import { TURN_SIZE_MIN_WIDTH } from '@/config/turn';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { SpeedControl, VolumeControl } from './Control';
import { AUDIO_HEIGHT } from '@/config/ui';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { MODE_WIDGET_AUDIO } from '@/config/panel';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { useMediaPlayback } from '../media/useMediaPlayback';

const Audio = ({
  registerHandleResize,
  unregisterHandleResize,
  turnId,
  widgetId,
}) => {
  const dispatch = useDispatch();
  const { can } = useUserContext();
  const title = useSelector((s) => s.turns.d[turnId].dWidgets.h_1?.text || '');
  const audioUrl = useSelector((s) => s.turns.d[turnId].dWidgets[widgetId].url);
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

  useEffect(() => {
    registerHandleResize({
      type: WIDGET_AUDIO,
      id: widgetId,
      minWidthCallback: () => TURN_SIZE_MIN_WIDTH,
      minHeightCallback: () => AUDIO_HEIGHT,
      maxHeightCallback: () => AUDIO_HEIGHT,
    });
    return () => unregisterHandleResize({ id: widgetId });
  }, []);

  return (
    <div className="turn-widget audio-player-wrapper flex flex-col w-full">
      <div className="flex justify-between w-full gap-4">
        <div className="audio-title-wrapper flex gap-2 items-center">
          <button className="icon-button" onClick={togglePlay}>
            {playing ? <FiPause /> : <FiPlay />}
          </button>
          <span className="truncate">{title}</span>
        </div>
        <div className="audio-info flex gap-2 items-center">
          {can(RULE_TURNS_CRUD) && duration > 0
            && false // TODO: пока нет возможности редактировать цитаты медиа (см. docs/backlog.md)
            && (
            <button
              className="icon-button"
              onClick={(e) => {
                e.preventDefault();
                dispatch(
                  setPanelMode({
                    mode: MODE_WIDGET_AUDIO,
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
          <span className="audio-time">{getFormattedDuration(progress)}</span>
          <SpeedControl speed={speed} setSpeed={setSpeed} />
          <VolumeControl
            volume={volume * 100}
            setVolume={handleVolumeChange}
            muted={muted}
            setMuted={setMuted}
          />
        </div>
      </div>
      <Slider
        className="w-full timeline-slider"
        min={0}
        max={duration}
        value={progress}
        onChange={seek}
        tooltip={{
          open: false,
        }}
      />
      <ReactPlayer
        ref={playerRef}
        src={audioUrl}
        playing={playing}
        muted={muted}
        volume={volume}
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        height="0"
        width="0"
        playbackRate={speed}
      />
    </div>
  );
};

export default Audio;

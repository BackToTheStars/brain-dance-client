import { Slider } from 'antd';
import { useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlay, FiPause, FiEdit } from 'react-icons/fi';
import { WIDGET_AUDIO } from '@/modules/turns/settings';
import { AUDIO_MIN_WIDTH } from '@/config/turn';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { SpeedControl, VolumeControl } from './Control';
import { AUDIO_HEIGHT } from '@/config/ui';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useMediaPlayback } from '../media/useMediaPlayback';
import { useQuoteMarks } from '../media/quoteMarks';
import { TID } from '@/config/testIds';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { PANEL_ADD_EDIT_TURN } from '@/config/panel';
import { openMediaQuotesPanel } from '@/modules/panels/redux/mediaQuotesPanel';

const Audio = ({
  registerHandleResize,
  unregisterHandleResize,
  turnId,
  widgetId,
}) => {
  const dispatch = useDispatch();
  const { can } = useUserContext();
  // Спутник экскурсии только смотрит: разметку не начинает — как и у карандаша
  // виджета, иначе он войдёт в режим, из которого ему нечем выйти.
  const following = useSelector(selectFollowing);
  // Панель цитат и форма хода вместе не открываются.
  const formOpen = useSelector((s) => !!s.panels.d[PANEL_ADD_EDIT_TURN]?.isDisplayed);
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
  const quoteMarks = useQuoteMarks(turnId, 'aq_1', duration);

  useEffect(() => {
    registerHandleResize({
      type: WIDGET_AUDIO,
      id: widgetId,
      minWidthCallback: () => AUDIO_MIN_WIDTH,
      minHeightCallback: () => AUDIO_HEIGHT,
      maxHeightCallback: () => AUDIO_HEIGHT,
    });
    return () => unregisterHandleResize({ id: widgetId });
  }, []);

  return (
    <div
      className="turn-widget audio-player-wrapper flex flex-col w-full"
      data-test-id={TID.media.player}
      data-turn-id={turnId}
      data-widget-id={widgetId}
      data-playing={playing ? 'true' : 'false'}
    >
      <div className="flex justify-between w-full gap-4">
        <div className="audio-title-wrapper flex gap-2 items-center">
          <button
            className="icon-button"
            data-test-id={TID.media.play}
            onClick={togglePlay}
          >
            {playing ? <FiPause /> : <FiPlay />}
          </button>
          <span className="truncate">{title}</span>
        </div>
        <div className="audio-info flex gap-2 items-center">
          {can(RULE_TURNS_CRUD) && !following && !formOpen && duration > 0 && (
            <button
              className="icon-button"
              data-test-id={TID.media.markup}
              onClick={(e) => {
                e.preventDefault();
                dispatch(openMediaQuotesPanel({ turnId, kind: 'audio' }));
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
        {...quoteMarks}
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

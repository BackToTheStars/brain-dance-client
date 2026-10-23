import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { useTranslations } from 'next-intl';
import { playbackClaim, playbackRelease } from '@/modules/ui/redux/actions';
import { TID } from '@/config/testIds';
import { getFormattedDuration } from '../../helpers/formatters/player';
import { useMediaPlaybackChannel } from './PlaybackContext';
import { atDeclaredEnd, createDeclaredDuration } from './declaredDuration';

// Общее состояние плеера для Media (видео) и Audio: react-player v3,
// интерфейс HTMLMediaElement. progress и duration — всегда в секундах.
//
// Взаимное исключение: одновременно играет только один плеер на игру.
// Ключ владельца { turnId, widgetId } лежит в ui.activePlayback (Redux);
// плеер, начавший играть, заявляет права, а вытесненный владелец,
// увидев чужой ключ, ставит себя на паузу. progress/duration в Redux
// не публикуются — они остаются в per-turn PlaybackContext.
//
// duration — заявленная длительность (declaredDuration.js): плеер не играет дальше неё.
export const useMediaPlayback = (widgetId, turnId) => {
  const dispatch = useDispatch();
  const t = useTranslations('Game.mediaQuotes');
  const playerRef = useRef(null);
  const declared = useRef(null);
  if (!declared.current) declared.current = createDeclaredDuration();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [speed, setSpeed] = useState(1);
  const { publish, register } = useMediaPlaybackChannel(widgetId);

  const isActive = useSelector((s) => {
    // защитный guard: если ui-редьюсера в сторе нет, арбитр считается выключенным,
    // иначе isActive был бы вечно false и плеер паузил бы сам себя
    if (!s.ui) return true;
    const active = s.ui.activePlayback;
    return (
      !!active && active.turnId === turnId && active.widgetId === widgetId
    );
  });

  // Права заявляются синхронно при старте, до setPlaying: к моменту рендера
  // с playing=true ключ в сторе уже наш, и эффект вытеснения не сработает
  // на самого себя.
  const togglePlay = useCallback(() => {
    if (!playing) {
      // с конца шкалы — сначала, как после ended
      const el = playerRef.current;
      if (el && atDeclaredEnd(el.currentTime, declared.current.declared)) {
        el.currentTime = 0;
        setProgress(0);
      }
      dispatch(playbackClaim({ turnId, widgetId }));
    }
    setPlaying(!playing);
  }, [playing, dispatch, turnId, widgetId]);

  const seek = useCallback((seconds) => {
    if (playerRef.current) playerRef.current.currentTime = seconds;
    setProgress(seconds);
  }, []);

  // value: 0..100 (из слайдеров громкости)
  const handleVolumeChange = useCallback((value) => {
    setVolume(value / 100);
    setMuted(value === 0);
  }, []);

  const notify = useCallback(
    (notice) => {
      if (!notice) return;
      const text = t('durationMismatch', {
        actual: getFormattedDuration(notice.actual),
        declared: getFormattedDuration(notice.declared),
      });
      message.info({
        content: <span data-test-id={TID.media.durationNotice}>{text}</span>,
      });
    },
    [t],
  );

  const onTimeUpdate = useCallback((e) => {
    const el = e.currentTarget;
    const time = el.currentTime || 0;
    const end = declared.current.declared;
    if (end > 0 && time >= end) {
      if (!el.paused) {
        setPlaying(false);
        el.currentTime = end;
      }
      setProgress(end);
      return;
    }
    setProgress(time);
  }, []);

  const onDurationChange = useCallback(
    (e) => {
      const reported = e.currentTarget.duration;
      notify(declared.current.duration(reported));
      setDuration(declared.current.declared || reported || 0);
    },
    [notify],
  );

  // Новый источник (правка хода меняет url без перемонтирования плеера) — своя заявленная длительность.
  const onLoadStart = useCallback(() => {
    declared.current.reset();
    setDuration(0);
  }, []);

  // Обратная синхронизация: воспроизведение может стартовать/останавливаться
  // внутри самого плеера (центральная кнопка и клик по поверхности
  // YouTube-iframe, жесты в фулскрине) — без неё controlled-проп `playing`
  // принудительно откатывал такой запуск через ~полсекунды, а центральный
  // значок YouTube залипал в противофазе. Обработчики идемпотентны: на наши
  // собственные команды события тоже приходят и не должны ничего менять.
  const onPlay = useCallback(() => {
    // как и в togglePlay: заявить права до setPlaying, чтобы эффект
    // вытеснения не сработал на самого себя
    dispatch(playbackClaim({ turnId, widgetId }));
    setPlaying(true);
  }, [dispatch, turnId, widgetId]);

  const onPause = useCallback(() => {
    setPlaying(false);
  }, []);

  const onEnded = useCallback(
    (e) => {
      setPlaying(false);
      notify(declared.current.ended(e.currentTarget.currentTime));
    },
    [notify],
  );

  // права перешли другому плееру — пауза
  useEffect(() => {
    if (playing && !isActive) {
      setPlaying(false);
    }
  }, [playing, isActive]);

  // на анмаунте освобождаем ключ (если владели — reducer проверит)
  useEffect(() => {
    return () => {
      dispatch(playbackRelease({ turnId, widgetId }));
    };
  }, [dispatch, turnId, widgetId]);

  useEffect(
    () => register({ togglePlay, seek }),
    [register, togglePlay, seek],
  );

  useEffect(() => {
    publish({ playing, progress, duration });
  }, [publish, playing, progress, duration]);

  return {
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
    onLoadStart,
    onPlay,
    onPause,
    onEnded,
  };
};

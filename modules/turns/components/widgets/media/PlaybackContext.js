import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

// Канал состояния воспроизведения в пределах одного Turn: плееры (v_1, a_1)
// публикуют своё состояние и регистрируют управление, виджеты цитат (vq_1, aq_1)
// читают состояние парного медиа-виджета. Вне провайдера (Storybook) — no-op.
const PlaybackContext = createContext(null);

export const MediaPlaybackProvider = ({ children }) => {
  // { [widgetId]: { playing, progress, duration } } — progress/duration в секундах
  const [states, setStates] = useState({});
  // управление не кладём в state: колбэки мутабельны и не должны вызывать ререндер
  const controlsRef = useRef({});

  const publishState = useCallback((widgetId, patch) => {
    setStates((prev) => {
      const prevState = prev[widgetId];
      if (
        prevState &&
        Object.keys(patch).every((key) => prevState[key] === patch[key])
      ) {
        return prev;
      }
      return { ...prev, [widgetId]: { ...prevState, ...patch } };
    });
  }, []);

  const registerControls = useCallback((widgetId, controls) => {
    controlsRef.current[widgetId] = controls;
    return () => {
      delete controlsRef.current[widgetId];
    };
  }, []);

  const getControls = useCallback(
    (widgetId) => controlsRef.current[widgetId] || {},
    [],
  );

  const value = useMemo(
    () => ({ states, publishState, registerControls, getControls }),
    [states, publishState, registerControls, getControls],
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
};

// Для плееров: публикация состояния и регистрация управления
export const useMediaPlaybackChannel = (widgetId) => {
  const ctx = useContext(PlaybackContext);

  const publish = useCallback(
    (patch) => {
      if (ctx) ctx.publishState(widgetId, patch);
    },
    [ctx, widgetId],
  );

  const register = useCallback(
    (controls) => {
      if (!ctx) return () => {};
      return ctx.registerControls(widgetId, controls);
    },
    [ctx, widgetId],
  );

  return { publish, register };
};

// Для потребителей (таймлайн цитат): состояние и управление медиа-виджетом
export const useMediaPlaybackState = (widgetId) => {
  const ctx = useContext(PlaybackContext);
  const state = (ctx && ctx.states[widgetId]) || {};

  const togglePlay = useCallback(() => {
    if (ctx) ctx.getControls(widgetId).togglePlay?.();
  }, [ctx, widgetId]);

  const seek = useCallback(
    (seconds) => {
      if (ctx) ctx.getControls(widgetId).seek?.(seconds);
    },
    [ctx, widgetId],
  );

  return {
    playing: !!state.playing,
    progress: state.progress || 0,
    duration: state.duration || 0,
    togglePlay,
    seek,
  };
};

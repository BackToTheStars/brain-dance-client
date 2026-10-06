import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

// Канал состояния воспроизведения в пределах одного Turn: плееры (v_1, a_1)
// публикуют своё состояние и регистрируют управление; читают его ▷ цитат и панель
// правки через реестр ниже. Вне провайдера — no-op.
const PlaybackContext = createContext(null);

// Каналы смонтированных карточек по turnId — для панели правки цитат, которая живёт вне карточки.
// Не Redux: progress / duration туда не публикуются.
const channels = new Map();
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const subscribePlayback = subscribe;
export const getPlaybackChannel = (turnId) => channels.get(turnId);

export const MediaPlaybackProvider = ({ turnId, children }) => {
  // { [widgetId]: { playing, progress, duration } } — progress/duration в секундах
  const [states, setStates] = useState({});
  // Реестр читает состояние сразу после публикации, в том же сбросе эффектов, что и новое управление
  // плеера: иначе стоп-точка цитаты увидела бы свежий togglePlay при устаревшем playing.
  const statesRef = useRef({});
  // управление не кладём в state: колбэки мутабельны и не должны вызывать ререндер
  const controlsRef = useRef({});
  const activatorsRef = useRef({});

  const publishState = useCallback((widgetId, patch) => {
    const prev = statesRef.current;
    const prevState = prev[widgetId];
    if (
      prevState &&
      Object.keys(patch).every((key) => prevState[key] === patch[key])
    ) {
      return;
    }
    statesRef.current = { ...prev, [widgetId]: { ...prevState, ...patch } };
    setStates(statesRef.current);
    emit();
  }, []);

  const registerControls = useCallback((widgetId, controls) => {
    controlsRef.current[widgetId] = controls;
    emit();
    return () => {
      delete controlsRef.current[widgetId];
      emit();
    };
  }, []);

  const getControls = useCallback(
    (widgetId) => controlsRef.current[widgetId] || {},
    [],
  );

  // Видео в превью: «смонтировать плеер» для ▷ цитаты, которая живёт вне виджета видео.
  const registerActivator = useCallback((widgetId, activate) => {
    activatorsRef.current[widgetId] = activate;
    return () => {
      if (activatorsRef.current[widgetId] === activate) {
        delete activatorsRef.current[widgetId];
      }
    };
  }, []);

  const entryRef = useRef(null);
  if (!entryRef.current) {
    entryRef.current = {
      get states() {
        return statesRef.current;
      },
      hasControls: (widgetId) => !!controlsRef.current[widgetId],
      getControls,
      activate: (widgetId) => {
        const activate = activatorsRef.current[widgetId];
        if (!activate) return false;
        activate();
        return true;
      },
    };
  }

  useEffect(() => {
    if (!turnId) return undefined;
    const entry = entryRef.current;
    channels.set(turnId, entry);
    emit();
    return () => {
      if (channels.get(turnId) === entry) channels.delete(turnId);
      emit();
    };
  }, [turnId]);

  const value = useMemo(
    () => ({ states, publishState, registerControls, getControls, registerActivator }),
    [states, publishState, registerControls, getControls, registerActivator],
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

// Для видео: пока activate не null, ▷ цитаты может смонтировать плеер.
export const useMediaActivator = (widgetId, activate) => {
  const ctx = useContext(PlaybackContext);
  useEffect(() => {
    if (!ctx || !activate) return undefined;
    return ctx.registerActivator(widgetId, activate);
  }, [ctx, widgetId, activate]);
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

const NO_STATE = {};

// Тот же канал снаружи карточки, по turnId. mounted — карточка смонтирована; available — плеер
// widgetId зарегистрировал управление (видео в превью и снятая карточка — нет).
export const usePlaybackChannel = (turnId, widgetId) => {
  const state = useSyncExternalStore(
    subscribe,
    () => channels.get(turnId)?.states[widgetId] || NO_STATE,
    () => NO_STATE,
  );
  const mounted = useSyncExternalStore(
    subscribe,
    () => channels.has(turnId),
    () => false,
  );
  const available = useSyncExternalStore(
    subscribe,
    () => !!channels.get(turnId)?.hasControls(widgetId),
    () => false,
  );

  const togglePlay = useCallback(() => {
    channels.get(turnId)?.getControls(widgetId).togglePlay?.();
  }, [turnId, widgetId]);

  const seek = useCallback(
    (seconds) => {
      channels.get(turnId)?.getControls(widgetId).seek?.(seconds);
    },
    [turnId, widgetId],
  );

  return {
    mounted,
    available,
    playing: available && !!state.playing,
    progress: state.progress || 0,
    duration: state.duration || 0,
    togglePlay,
    seek,
  };
};

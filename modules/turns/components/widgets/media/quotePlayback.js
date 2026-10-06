import { useSyncExternalStore } from 'react';
import { getPlaybackChannel, subscribePlayback } from './PlaybackContext';
import { QUOTE_LOADING_MS, quoteCommand, stopStep } from './quoteStop';

// Стоп-точка ▷ цитаты — одна на игру, как и играющий плеер; хук плеера о ней не знает,
// плеером она управляет только через его togglePlay / seek из канала.
let stop = null;
const listeners = new Set();
let unsubscribeChannels = null;
let queued = false;
let loadingTimer = null;

const notify = () => listeners.forEach((listener) => listener());

const subscribeStop = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const observe = (turnId, playerId) => {
  const entry = getPlaybackChannel(turnId);
  const state = entry?.states[playerId] || {};
  return {
    entry,
    seen: {
      mounted: !!entry,
      available: !!entry?.hasControls(playerId),
      playing: !!state.playing,
      progress: state.progress || 0,
      duration: state.duration || 0,
    },
  };
};

const start = (entry, playerId, seconds, playing) => {
  const controls = entry.getControls(playerId);
  controls.seek?.(seconds);
  if (!playing) controls.togglePlay?.();
};

const setStop = (next) => {
  if (next === stop) return;
  const wasLoading = stop?.phase === 'loading';
  stop = next;
  if (stop && !unsubscribeChannels) {
    unsubscribeChannels = subscribePlayback(schedule);
  } else if (!stop && unsubscribeChannels) {
    unsubscribeChannels();
    unsubscribeChannels = null;
  }
  if (wasLoading && stop?.phase !== 'loading' && loadingTimer) {
    clearTimeout(loadingTimer);
    loadingTimer = null;
  }
  notify();
};

const evaluate = () => {
  queued = false;
  if (!stop) return;
  const { entry, seen } = observe(stop.turnId, stop.playerId);
  const current = stop;
  const { stop: next, action } = stopStep(current, seen, Date.now());
  if (action === 'start') start(entry, current.playerId, current.start, seen.playing);
  if (action === 'pause' && seen.playing) entry.getControls(current.playerId).togglePlay?.();
  setStop(next);
};

// Плеер перерегистрирует управление на каждый play / pause (снятие и регистрация — два оповещения
// подряд): решать после сброса эффектов, когда канал снова целый.
const schedule = () => {
  if (queued || !stop) return;
  queued = true;
  queueMicrotask(evaluate);
};

export const toggleQuotePlayback = ({ turnId, playerId, quoteId, start: from, end }) => {
  const { entry, seen } = observe(turnId, playerId);
  const command = quoteCommand(stop, { turnId, playerId, quoteId }, seen);
  const now = Date.now();
  const fresh = { turnId, playerId, quoteId, start: from, end, since: now };
  switch (command) {
    case 'pause':
      entry.getControls(playerId).togglePlay?.();
      setStop({ ...stop, phase: 'held' });
      return;
    case 'resume':
      entry.getControls(playerId).togglePlay?.();
      setStop({ ...stop, phase: 'starting', since: now });
      return;
    case 'start':
      start(entry, playerId, from, seen.playing);
      setStop({ ...fresh, phase: 'starting' });
      return;
    case 'load':
      if (!seen.available && !entry.activate(playerId)) return;
      if (loadingTimer) clearTimeout(loadingTimer);
      setStop({ ...fresh, phase: 'loading' });
      loadingTimer = setTimeout(() => {
        loadingTimer = null;
        if (stop?.phase === 'loading' && stop.since === now) setStop(null);
      }, QUOTE_LOADING_MS);
      return;
    default:
  }
};

const isQuote = (s, turnId, playerId, quoteId) =>
  !!s &&
  s.turnId === turnId &&
  s.playerId === playerId &&
  String(s.quoteId) === String(quoteId);

const subscribeAll = (listener) => {
  const offStop = subscribeStop(listener);
  const offChannels = subscribePlayback(listener);
  return () => {
    offStop();
    offChannels();
  };
};

// 'loading' | 'playing' | 'idle' — для значка ▷ / ❚❚ строки цитаты.
export const useQuotePlayback = (turnId, playerId, quoteId) =>
  useSyncExternalStore(
    subscribeAll,
    () => {
      if (!isQuote(stop, turnId, playerId, quoteId)) return 'idle';
      if (stop.phase === 'loading') return 'loading';
      if (stop.phase === 'held') return 'idle';
      return getPlaybackChannel(turnId)?.states[playerId]?.playing ? 'playing' : 'idle';
    },
    () => 'idle',
  );

// Плеер ленты готовится по ▷ одной из её цитат — лоадер на весь список.
export const useQuoteLoading = (turnId, playerId) =>
  useSyncExternalStore(
    subscribeStop,
    () =>
      !!stop &&
      stop.phase === 'loading' &&
      stop.turnId === turnId &&
      stop.playerId === playerId,
    () => false,
  );

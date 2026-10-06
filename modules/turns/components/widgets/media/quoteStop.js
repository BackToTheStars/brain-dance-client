// Стоп-точка проигрывания цитаты: чистое решение по наблюдению канала плеера.
// Наблюдение — { mounted, available, playing, progress, duration }, время — в секундах.

export const QUOTE_LOADING_MS = 3000;
export const QUOTE_STARTING_MS = 1500;
// progress приходит около 4 раз в секунду, на скорости 2,5 шаг до 0,6 с; больше — перемотка.
export const QUOTE_MAX_STEP = 1;
export const QUOTE_NEAR = 0.5;

const inRange = (stop, progress) =>
  progress >= stop.start - QUOTE_NEAR && progress < stop.end;

// → { stop: следующая стоп-точка или null, action: 'start' | 'pause' | undefined }
export const stopStep = (stop, seen, now) => {
  if (!stop) return { stop: null };
  if (!seen.mounted) return { stop: null };

  if (stop.phase === 'loading') {
    if (now - stop.since >= QUOTE_LOADING_MS) return { stop: null };
    if (seen.available && seen.duration > 0) {
      return { stop: { ...stop, phase: 'starting', since: now }, action: 'start' };
    }
    return { stop };
  }

  if (!seen.available) return { stop: null };

  if (stop.phase === 'starting') {
    if (seen.playing && inRange(stop, seen.progress)) {
      return { stop: { ...stop, phase: 'playing', last: seen.progress } };
    }
    if (now - stop.since >= QUOTE_STARTING_MS) return { stop: null };
    return { stop };
  }

  if (stop.phase === 'playing') {
    if (!seen.playing) return { stop: null };
    if (seen.progress >= stop.end) {
      return seen.progress - stop.last <= QUOTE_MAX_STEP
        ? { stop: null, action: 'pause' }
        : { stop: null };
    }
    if (seen.progress < stop.start - QUOTE_NEAR) return { stop: null };
    return seen.progress === stop.last
      ? { stop }
      : { stop: { ...stop, last: seen.progress } };
  }

  if (stop.phase === 'held') {
    if (seen.playing) {
      return inRange(stop, seen.progress)
        ? { stop: { ...stop, phase: 'playing', last: seen.progress } }
        : { stop: null };
    }
    return seen.progress >= stop.start - QUOTE_NEAR && seen.progress <= stop.end
      ? { stop }
      : { stop: null };
  }

  return { stop: null };
};

// Что делает ▷ цитаты: 'pause' | 'resume' (после своей паузы) | 'wait' (плеер уже готовится) |
// 'start' (перемотать и запустить) | 'load' (смонтировать плеер, ждать готовности) | 'none'.
export const quoteCommand = (stop, quote, seen) => {
  const same =
    !!stop &&
    stop.turnId === quote.turnId &&
    stop.playerId === quote.playerId &&
    String(stop.quoteId) === String(quote.quoteId);
  if (same && stop.phase === 'loading') return 'wait';
  if (same && seen.available && seen.playing && stop.phase !== 'held') return 'pause';
  if (
    same &&
    stop.phase === 'held' &&
    seen.available &&
    !seen.playing &&
    inRange(stop, seen.progress)
  ) {
    return 'resume';
  }
  if (!seen.mounted) return 'none';
  if (seen.available && seen.duration > 0) return 'start';
  return 'load';
};

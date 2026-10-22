export const SKIP_SECONDS = 10;

export const skipTarget = (progress, delta, duration) => {
  const now = Number.isFinite(progress) ? progress : 0;
  if (!(duration > 0)) return now;
  return Math.min(Math.max(now + delta, 0), duration);
};

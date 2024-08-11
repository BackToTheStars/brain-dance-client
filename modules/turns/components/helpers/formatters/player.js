export const getFormattedDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

import { STATIC_MEDIA_URL } from '@/config/server';
import { getYoutubeVideoId } from './videoUrl';

export const FRAME_DEFAULT_SECONDS = 5;
// Как у кадра media в админке: JPEG вписан в 1280 по ширине.
const FRAME_MAX_WIDTH = 1280;
const FRAME_JPEG_QUALITY = 0.85;
const EVENT_TIMEOUT_MS = 10000;
// Chrome с аппаратным декодером отдаёт пустой кадр сразу после seeked — ждём следующий.
const BLANK_FRAME_WAIT_MS = 1500;

export class VideoFrameError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // decode | timeout | load | cors
  }
}

const getHost = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};

// Кадр снимается только с видео своей media: у чужого хоста нет CORS, canvas не отдаст картинку.
export const isOwnMediaVideo = (url) => {
  const host = getHost(url);
  return (
    !!host &&
    host === getHost(STATIC_MEDIA_URL) &&
    new URL(url).pathname.startsWith('/videos/')
  );
};

export const hasPreviewBlock = (url) =>
  /^https?:\/\/[^/]/i.test(url || '') && !getYoutubeVideoId(url);

export const roundSeconds = (seconds) => Math.round(seconds * 1000) / 1000;

export const clampSeconds = (seconds, duration) => {
  const value = Math.max(0, Number(seconds) || 0);
  return Number.isFinite(duration) ? Math.min(value, duration) : value;
};

export const frameFileName = (videoName, seconds) => {
  const base = (videoName || '')
    .split('/')
    .pop()
    .replace(/\.[^.]*$/, '')
    .replace(/[^\w.-]+/g, '_');
  return `${base || 'video'}-frame-${roundSeconds(seconds)}.jpg`;
};

const waitEvent = (video, name) =>
  new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener(name, onEvent);
      video.removeEventListener('error', onError);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      const code = video.error?.code;
      reject(
        new VideoFrameError(code === 2 ? 'load' : 'decode', video.error?.message),
      );
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new VideoFrameError('timeout'));
    }, EVENT_TIMEOUT_MS);
    video.addEventListener(name, onEvent);
    video.addEventListener('error', onError);
  });

const nextVideoFrame = (video, ms) =>
  new Promise((resolve) => {
    let handle = null;
    const timer = setTimeout(() => {
      if (handle !== null) video.cancelVideoFrameCallback(handle);
      resolve();
    }, ms);
    if (typeof video.requestVideoFrameCallback === 'function') {
      handle = video.requestVideoFrameCallback(() => {
        clearTimeout(timer);
        resolve();
      });
    }
  });

const isBlankFrame = (video) => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 9;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let data;
  try {
    data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch (err) {
    throw new VideoFrameError('cors', err?.message);
  }
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) return false;
  }
  return true;
};

// Кадр с загруженного <video>: { dataUrl, t, duration, width, height }.
export const grabVideoFrame = async (video, seconds) => {
  if (video.readyState < 1) await waitEvent(video, 'loadedmetadata');
  if (!video.videoWidth) throw new VideoFrameError('decode');
  const t = clampSeconds(seconds, video.duration);
  if (video.readyState < 2 || Math.abs(video.currentTime - t) > 0.001) {
    const seeked = waitEvent(video, 'seeked');
    video.currentTime = t;
    await seeked;
  }
  const deadline = Date.now() + BLANK_FRAME_WAIT_MS;
  while (isBlankFrame(video)) {
    if (Date.now() > deadline) throw new VideoFrameError('decode');
    await nextVideoFrame(video, 50);
  }
  const scale = Math.min(1, FRAME_MAX_WIDTH / video.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  // toDataURL, а не toBlob: в headless Chromium toBlob ждёт простоя до секунды.
  let dataUrl;
  try {
    dataUrl = canvas.toDataURL('image/jpeg', FRAME_JPEG_QUALITY);
  } catch (err) {
    throw new VideoFrameError('cors', err?.message);
  }
  if (!dataUrl.startsWith('data:image/jpeg')) throw new VideoFrameError('decode');
  return {
    dataUrl,
    t: roundSeconds(video.currentTime),
    duration: video.duration,
    width: canvas.width,
    height: canvas.height,
  };
};

export const dataUrlToFile = (dataUrl, name) => {
  const [head, body] = dataUrl.split(',');
  const type = head.match(/^data:([^;]+)/)?.[1] || 'application/octet-stream';
  const bytes = atob(body);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
  return new File([buffer], name, { type });
};

// Кадр по адресу или blob: URL файла — отдельным невидимым <video>.
export const captureVideoFrame = async (src, seconds, { crossOrigin } = {}) => {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  if (crossOrigin) video.crossOrigin = 'anonymous';
  try {
    const loaded = waitEvent(video, 'loadedmetadata');
    video.src = src;
    await loaded;
    return await grabVideoFrame(video, seconds);
  } finally {
    video.removeAttribute('src');
    video.load();
  }
};

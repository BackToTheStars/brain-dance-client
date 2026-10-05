import { STATIC_MEDIA_URL } from '@/config/server';
import { UPLOAD_ACCEPT } from '../../settings';
import { getYoutubeVideoId } from './videoUrl';

// Предел ожидания при Save. Картинка узнаётся по размеру из первых байт, видео
// и аудио — по метаданным; кто молчит дольше — неизвестно, не отказ.
export const MEDIA_CHECK_TIMEOUT_MS = 3000;

const MEDIA_TYPES = Object.keys(UPLOAD_ACCEPT);
const extensionsOf = (type) => Object.values(UPLOAD_ACCEPT[type]).flat();

// Расширения других типов, которых нет у своего: .webm и .ogg не чужие ни
// видео, ни аудио.
const FOREIGN_EXTENSIONS = Object.fromEntries(
  MEDIA_TYPES.map((type) => {
    const own = new Set(extensionsOf(type));
    const foreign = MEDIA_TYPES.filter((other) => other !== type)
      .flatMap(extensionsOf)
      .filter((extension) => !own.has(extension));
    return [type, new Set(foreign)];
  }),
);

const pathOf = (url) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split(/[?#]/)[0];
  }
};

const extensionOf = (url) => {
  const name = pathOf(url).split('/').pop();
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot).toLowerCase() : '';
};

const ownMediaType = (url) => {
  const base = `${STATIC_MEDIA_URL.replace(/\/+$/, '')}/`;
  if (!url.startsWith(base)) return null;
  const type = url.slice(base.length).split('/')[0];
  return MEDIA_TYPES.includes(type) ? type : null;
};

const isYoutubeVideo = (url, type) =>
  type === 'videos' && !!getYoutubeVideoId(url);

// Не тот тип виден по самому адресу: файл своей media другого типа или чужое
// расширение. Всё остальное решает пробная загрузка.
export const isNotMediaUrl = (url, type) => {
  if (isYoutubeVideo(url, type)) return false;
  const own = ownMediaType(url);
  return (
    (!!own && own !== type) ||
    FOREIGN_EXTENSIONS[type].has(extensionOf(url))
  );
};

// pdf.js читает через fetch: чужой хост без CORS не откроется и с настоящим pdf.
// Своё видео и аудио media приняла по расширению.
export const needsProbe = (url, type) => {
  if (type === 'pdfs' || isYoutubeVideo(url, type)) return false;
  return type === 'images' || ownMediaType(url) !== type;
};

const probeImage = (url, timeoutMs) =>
  new Promise((resolve) => {
    const img = new Image();
    const finish = (result) => {
      clearTimeout(timer);
      clearInterval(sizePoll);
      img.onload = null;
      img.onerror = null;
      if (result === 'timeout') img.removeAttribute('src');
      resolve(result);
    };
    const timer = setTimeout(() => finish('timeout'), timeoutMs);
    // размер известен задолго до конца загрузки крупного файла
    const sizePoll = setInterval(() => img.naturalWidth && finish('ok'), 50);
    img.onload = () => finish('ok');
    img.onerror = () => finish('error');
    img.src = url;
  });

const probeElement = (tag, url, timeoutMs) =>
  new Promise((resolve) => {
    const media = document.createElement(tag);
    const finish = (result) => {
      clearTimeout(timer);
      media.onloadedmetadata = null;
      media.onerror = null;
      media.removeAttribute('src');
      media.load();
      resolve(result);
    };
    const timer = setTimeout(() => finish('timeout'), timeoutMs);
    media.muted = true;
    media.preload = 'metadata';
    media.onloadedmetadata = () => finish('ok');
    media.onerror = () => finish('error');
    media.src = url;
  });

// 'ok' | 'error' | 'timeout'
export const probeMedia = (url, type, timeoutMs = MEDIA_CHECK_TIMEOUT_MS) => {
  if (type === 'images') return probeImage(url, timeoutMs);
  return probeElement(type === 'videos' ? 'video' : 'audio', url, timeoutMs);
};

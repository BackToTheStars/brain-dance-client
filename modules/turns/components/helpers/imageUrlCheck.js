import { STATIC_MEDIA_URL } from '@/config/server';
import { UPLOAD_ACCEPT } from '../../settings';

// Предел ожидания при Save. Картинка узнаётся по размеру из первых байт, поэтому
// 3 с хватает на медленный ответ хоста; кто молчит дольше — неизвестно, не отказ.
export const IMAGE_CHECK_TIMEOUT_MS = 3000;

const NOT_IMAGE_TYPES = ['videos', 'audios', 'pdfs'];
const NOT_IMAGE_EXTENSIONS = new Set(
  NOT_IMAGE_TYPES.flatMap((type) => Object.values(UPLOAD_ACCEPT[type]).flat()),
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
  return url.startsWith(base) ? url.slice(base.length).split('/')[0] : null;
};

// Не картинка видна по самому адресу: файл своей media другого типа или расширение
// видео, аудио, pdf. Всё остальное решает пробная загрузка.
export const isNotImageUrl = (url) =>
  NOT_IMAGE_TYPES.includes(ownMediaType(url)) ||
  NOT_IMAGE_EXTENSIONS.has(extensionOf(url));

// 'image' | 'error' | 'timeout'
export const probeImage = (url, timeoutMs = IMAGE_CHECK_TIMEOUT_MS) =>
  new Promise((resolve) => {
    const img = new Image();
    const finish = (result) => {
      clearTimeout(timer);
      clearInterval(sizePoll);
      img.onload = null;
      img.onerror = null;
      resolve(result);
    };
    const timer = setTimeout(() => finish('timeout'), timeoutMs);
    // размер известен задолго до конца загрузки крупного файла
    const sizePoll = setInterval(() => img.naturalWidth && finish('image'), 50);
    img.onload = () => finish('image');
    img.onerror = () => finish('error');
    img.src = url;
  });

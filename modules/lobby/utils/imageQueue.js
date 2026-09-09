import { STATIC_MEDIA_URL } from '@/config/server';

// Полтора десятка недостижимых хостов занимают очередь разрешения имён целиком, и
// следующий запрос страницы ждёт её освобождения: миниатюры идут по три за раз.
export const MAX_PARALLEL_IMAGES = 3;
// Недостижимый хост браузер отпускает через 19-38 с, достижимая картинка отвечает за
// десятки миллисекунд: 5 с заведомо больше живой и в разы короче ожидания браузера.
export const IMAGE_TIMEOUT_MS = 5000;

const sameHost = (origin) => {
  if (typeof window === 'undefined') return true;
  if (origin === window.location.origin) return true;
  try {
    return origin === new URL(STATIC_MEDIA_URL).origin;
  } catch {
    return false;
  }
};

// Чужой хост может не ответить вовсе; свой (страница и media) отвечает или отказывает.
export const isForeignImage = (src) => {
  if (!src || typeof window === 'undefined') return false;
  if (src.startsWith('/') || src.startsWith('data:')) return false;
  try {
    return !sameHost(new URL(src, window.location.href).origin);
  } catch {
    return false;
  }
};

let running = 0;
const waiting = [];

const pump = () => {
  while (running < MAX_PARALLEL_IMAGES && waiting.length) {
    running += 1;
    waiting.shift()();
  }
};

// start() зовётся, когда освободился слот. Возвращает release: его зовут, когда
// картинка ответила, отвалилась, вышло время или карточка размонтирована.
export const enqueueImage = (start) => {
  let state = 'waiting';
  const task = () => {
    state = 'running';
    start();
  };
  waiting.push(task);
  pump();
  return () => {
    if (state === 'waiting') {
      const index = waiting.indexOf(task);
      if (index !== -1) waiting.splice(index, 1);
    } else if (state === 'running') {
      running -= 1;
      pump();
    }
    state = 'released';
  };
};

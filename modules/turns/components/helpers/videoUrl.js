const YOUTUBE_HOST_RE = /(^|\.)(youtube(-nocookie)?\.com|youtu\.be)$/;
// id ролика — 11 символов [A-Za-z0-9_-], допускаем небольшой разброс на будущее
const YOUTUBE_ID_RE = /^[\w-]{6,20}$/;

// Достаёт id ролика из любых форм YouTube-ссылок:
// watch?v=, youtu.be/, /shorts/, /embed/, /live/, /v/, youtube-nocookie.com,
// с любыми лишними query-параметрами (&t=, &list= и т.п.).
// Возвращает null, если это не YouTube-ссылка.
export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  let parsed;
  try {
    parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, '');
  if (!YOUTUBE_HOST_RE.test(host)) return null;

  if (host === 'youtu.be') {
    const id = parsed.pathname.split('/')[1] || '';
    return YOUTUBE_ID_RE.test(id) ? id : null;
  }

  const v = parsed.searchParams.get('v');
  if (v && YOUTUBE_ID_RE.test(v)) return v;

  const match = parsed.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{6,20})/);
  return match ? match[2] : null;
};

export const getYoutubePreviewUrl = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

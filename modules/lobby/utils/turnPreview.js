import { getYoutubeVideoId } from '@/modules/turns/components/helpers/videoUrl';

export const VIDEO_PREVIEW_FALLBACK = '/img/video-default.png';

// Картинка хода в ленте и слайдере: своя картинка, миниатюра YouTube, превью видео
// (videoPreview) или заглушка.
export const getTurnPreviewSrc = ({ imageUrl, videoUrl, videoPreview } = {}) => {
  if (imageUrl) return imageUrl;
  if (!videoUrl) return null;
  const youtubeId = getYoutubeVideoId(videoUrl);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
  return videoPreview || VIDEO_PREVIEW_FALLBACK;
};

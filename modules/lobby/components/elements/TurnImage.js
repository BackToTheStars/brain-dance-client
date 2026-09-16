import { useCallback, useEffect, useRef, useState } from 'react';
import { TID } from '@/config/testIds';
import {
  IMAGE_TIMEOUT_MS,
  enqueueImage,
  isForeignImage,
} from '../../utils/imageQueue';

const FALLBACK_SRC = '/img/video-default.png';
const NEAR_VIEWPORT = '300px';

const TurnImage = ({
  src,
  alt = '#',
  wrapperClassName = 'base-card__widget',
  imgClassName = 'w-full h-auto rounded',
}) => {
  const boxRef = useRef(null);
  const releaseRef = useRef(null);
  const timerRef = useRef(null);
  const [near, setNear] = useState(false);
  const [shownSrc, setShownSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const release = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
  }, []);

  useEffect(() => {
    const node = boxRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: NEAR_VIEWPORT },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLoaded(false);
    setShownSrc(null);
    if (!near || !src) return undefined;
    if (!isForeignImage(src)) {
      setShownSrc(src);
      return undefined;
    }
    releaseRef.current = enqueueImage(() => {
      setShownSrc(src);
      timerRef.current = setTimeout(() => {
        setShownSrc(FALLBACK_SRC);
        release();
      }, IMAGE_TIMEOUT_MS);
    });
    return release;
  }, [near, src, release]);

  const onSettled = () => {
    setLoaded(true);
    release();
  };

  const onFailed = () => {
    release();
    if (shownSrc !== FALLBACK_SRC) setShownSrc(FALLBACK_SRC);
  };

  return (
    <div
      ref={boxRef}
      className={wrapperClassName}
      data-test-id={TID.lobbyTurn.image}
      data-image-state={loaded ? 'loaded' : shownSrc ? 'loading' : 'idle'}
      // место под миниатюру держим до загрузки, иначе лента прыгает при подстановке
      style={loaded ? undefined : { aspectRatio: '4 / 3' }}
    >
      {!!shownSrc && (
        <img
          src={shownSrc}
          alt={alt}
          loading="lazy"
          className={imgClassName}
          onLoad={onSettled}
          onError={onFailed}
        />
      )}
    </div>
  );
};

export default TurnImage;

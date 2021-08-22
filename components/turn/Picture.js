import { useEffect, useState, useRef } from 'react';
import { RULE_TURNS_CRUD } from '../config';

const Picture = ({
  imageUrl,
  registerHandleResize,
  unregisterHandleResize,
}) => {
  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imgEl || !imgEl.current) return; // была ошибка React state update on an unmounted component
    const loadImage = () => {
      setImageLoaded(true);
    };
    imgEl.current.addEventListener('load', loadImage);
  }, [imgEl]);

  useEffect(() => {
    if (imageLoaded) {
      console.log('image widget resize');
      registerHandleResize({
        type: 'picture',
        id: 'picture',
        minWidthCallback: () => {
          return 0;
        },
        minHeightCallback: (newWidth) => {
          const newImgHeight = Math.floor(
            (imgEl.current.naturalHeight * newWidth) /
              imgEl.current.naturalWidth
          );
          return newImgHeight;
        },
        maxHeightCallback: (newWidth) => {
          const newImgHeight = Math.floor(
            (imgEl.current.naturalHeight * newWidth) /
              imgEl.current.naturalWidth
          );
          return newImgHeight;
        },
      });
    } else {
      // @todo: default handler
    }
    unregisterHandleResize({ id: 'picture' });
  }, [imageLoaded]);

  return (
    <div className="picture-content" ref={imgWrapperEl}>
      <img src={imageUrl} ref={imgEl} />
    </div>
  );
};

export default Picture;

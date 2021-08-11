import { useEffect, useState, useRef } from 'react';
import { RULE_TURNS_CRUD } from '../config';

const Picture = ({ imageUrl, registerHandleResize }) => {
  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imgEl || !imgEl.current) return;
    imgEl.current.onload = () => {
      setImageLoaded(true);
    };
  }, [imgEl]);

  useEffect(() => {
    if (imageLoaded) {
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
  }, [imageLoaded]);

  return (
    <div className="picture-content" ref={imgWrapperEl}>
      <img src={imageUrl} ref={imgEl} />
    </div>
  );
};

export default Picture;

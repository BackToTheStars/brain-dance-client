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
  const [imageUrlToRender, setImageUrlToRender] = useState(imageUrl);

  useEffect(() => {
    if (!imgEl || !imgEl.current) return; // была ошибка React state update on an unmounted component
    const loadImage = () => {
      if (imgEl.current) {
        setImageLoaded(true);
      }
    };
    imgEl.current.addEventListener('load', loadImage);
    imgEl.current.addEventListener('error', () => {
      console.log('on image error');
      setImageUrlToRender('/img/404.jpg');
    });
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
          if (!imgEl.current || !imgEl.current.naturalHeight) return 0;
          const newImgHeight = Math.floor(
            (imgEl.current.naturalHeight * newWidth) /
              imgEl.current.naturalWidth
          );
          return newImgHeight;
        },
        maxHeightCallback: (newWidth) => {
          if (!imgEl.current || !imgEl.current.naturalHeight) return 0;
          const newImgHeight = Math.floor(
            (imgEl.current.naturalHeight * newWidth) /
              imgEl.current.naturalWidth
          );
          return newImgHeight;
        },
      });
    } else {
      // registerHandleResize({
      //   type: 'picture',
      //   id: 'picture',
      //   minWidthCallback: () => {
      //     return 0;
      //   },
      //   minHeightCallback: (newWidth) => {
      //     const newImgHeight = Math.floor((400 * newWidth) / 700);
      //     return newImgHeight;
      //   },
      //   maxHeightCallback: (newWidth) => {
      //     const newImgHeight = Math.floor((400 * newWidth) / 700);
      //     return newImgHeight;
      //   },
      // });
    }
    return () => unregisterHandleResize({ id: 'picture' }); // будет вызван в момент unmountComponent()
  }, [imageLoaded]);

  return (
    <div className="picture-content" ref={imgWrapperEl}>
      <img src={imageUrlToRender} ref={imgEl} />
    </div>
  );
};

export default Picture;

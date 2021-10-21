import { useEffect, useState, useRef } from 'react';
import { RULE_TURNS_CRUD } from '../config';
import { INTERACTION_ADD_QUOTE } from './settings';
import ReactCrop from 'react-image-crop';
import { useInteractionContext } from '../contexts/InteractionContext';

const Picture = ({
  imageUrl,
  registerHandleResize,
  unregisterHandleResize,
  widgetId,
  widgetType,
  makeWidgetActive,
  isActive,
  interactionType,
}) => {
  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);
  const { actionsCallback } = useInteractionContext();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrlToRender, setImageUrlToRender] = useState(imageUrl);
  const [crop, setCrop] = useState({
    unit: '%',
  });
  // { aspect: 16 / 9 });

  const handleOnMouseOver = () => {};

  useEffect(() => {
    if (!isActive) return;
    if (interactionType === INTERACTION_ADD_QUOTE) {
      console.log('crop saved! ', crop);
      // actionsCallback();
      console.log({ actionsCallback });
    }
  }, [actionsCallback]);

  useEffect(() => {
    if (isActive && interactionType === INTERACTION_ADD_QUOTE) {
      setCrop({
        unit: '%',
      });
    }
  }, [isActive, interactionType]);

  useEffect(() => {
    if (!imgEl || !imgEl.current) return; // была ошибка React state update on an unmounted component
    const loadImage = () => {
      if (imgEl && imgEl.current) {
        setImageLoaded(true);
      }
    };

    const errorPicture = () => {
      console.log('on image error');
      setImageUrlToRender('/img/404.jpg');
    };

    imgEl.current.addEventListener('load', loadImage);
    imgEl.current.addEventListener('error', errorPicture);

    // @todo: проверить
    return () => {
      // в момент когда мы удаляем компонент, unMount
      if (imgEl.current) {
        imgEl.current.removeEventListener('load', loadImage);
        imgEl.current.removeEventListener('error', errorPicture);
      }
    };
  }, [imgEl]);

  useEffect(() => {
    if (imageLoaded) {
      registerHandleResize({
        type: widgetType,
        id: widgetId,
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
      if (!!imgEl.current && !!imgEl.current.complete) {
        console.log('setImageLoaded(true)');
        setImageLoaded(true);
      }
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
    return () => unregisterHandleResize({ id: 'picture' }); // return callback будет вызван в момент unmountComponent()
  }, [imageLoaded]);

  return (
    <div
      className={`${isActive && 'active'} picture-content`}
      ref={imgWrapperEl}
    >
      {isActive && interactionType === INTERACTION_ADD_QUOTE && (
        <>
          {/* <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
            Режим добавления цитаты
          </div> */}
          <ReactCrop
            src={imageUrl}
            className="picture-react-crop"
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
          />
        </>
      )}
      <img src={imageUrlToRender} ref={imgEl} onMouseOver={handleOnMouseOver} />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          makeWidgetActive();
        }}
      >
        <i className="fas fa-highlighter"></i>
      </a>
    </div>
  );
};

export default Picture;

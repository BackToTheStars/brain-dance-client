import { setPanelMode } from '@/modules/panels/redux/actions';
import {
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/modules/panels/settings';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PictureCrop from './Crop';
import PictureQuotes from './Quotes';

const Picture = ({
  imageUrl,
  registerHandleResize,
  unregisterHandleResize,
  widgetId,
  widgetType,
  turnId,
}) => {
  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);

  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrlToRender, setImageUrlToRender] = useState(imageUrl);
  // const [displayCrop, setDisplayCrop] = useState(false);

  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const editWidgetId = useSelector((state) => state.panels.editWidgetId);
  const mode = useSelector((state) => state.panels.mode);
  const editWidgetParams = useSelector(
    (state) => state.panels.editWidgetParams[`${editTurnId}_${editWidgetId}`]
  );
  const isActive = editTurnId === turnId && editWidgetId === widgetId;

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
        resizeCallback: () => {},
      });
    } else {
      if (!!imgEl.current && !!imgEl.current.complete) {
        setImageLoaded(true);
      }
    }
    return () => {
      unregisterHandleResize({ id: 'picture' });
    };
  }, [imageLoaded]);

  return (
    <div
      className={`picture-content ${isActive ? 'active' : ''}`}
      ref={imgWrapperEl}
    >
      {/* {displayCrop &&  */}
      {isActive && mode === MODE_WIDGET_PICTURE_QUOTE_ADD && (
        <PictureCrop
          imageUrl={imageUrlToRender}
          widgetKey={`${turnId}_${widgetId}`}
          stateCrop={editWidgetParams?.crop}
          activeQuoteId={editWidgetParams?.activeQuoteId}
        />
      )}
      <PictureQuotes
        turnId={turnId}
        widgetId={widgetId}
        activeQuoteId={editWidgetParams?.activeQuoteId}
        mode={mode}
        // quotes={
        //   interactionType === INTERACTION_ADD_OR_EDIT_QUOTE && !!activeQuote
        //     ? quotes.filter((quote) => quote.id !== activeQuote.quoteId)
        //     : quotes
        // }
      />
      <img src={imageUrlToRender} ref={imgEl} />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          // setDisplayCrop(true);
          dispatch(
            setPanelMode({
              mode: MODE_WIDGET_PICTURE,
              params: { editTurnId: turnId, editWidgetId: widgetId },
            })
          );
        }}
      >
        <i className="fas fa-highlighter"></i>
      </a>
    </div>
  );
};

export default Picture;

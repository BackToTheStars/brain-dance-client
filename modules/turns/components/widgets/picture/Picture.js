import { widgetSpacer as widgetSpacerOriginal } from '@/config/ui';
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
  registerHandleResize,
  unregisterHandleResize,
  turnId,
  widgetSettings,

  // imageUrl,
  pictureOnly, // отдельный тип
  widgetId,
  widgetType,
}) => {
  //
  const imageUrl = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId].url
  );
  const widgetSpacer = pictureOnly ? 0 : widgetSpacerOriginal;

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
    setImageUrlToRender(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    if (!imgEl || !imgEl.current) return; // была ошибка React state update on an unmounted component
    const loadImage = () => {
      if (imgEl && imgEl.current) {
        setImageLoaded(Date.now());
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
          const newImgHeight =
            Math.floor(
              (imgEl.current.naturalHeight * (newWidth - 2 * widgetSpacer)) /
                imgEl.current.naturalWidth
            ) + widgetSpacer;
          return newImgHeight;
        },
        maxHeightCallback: (newWidth) => {
          if (!imgEl.current || !imgEl.current.naturalHeight) return 0;
          const newImgHeight =
            Math.floor(
              (imgEl.current.naturalHeight * (newWidth - 2 * widgetSpacer)) /
                imgEl.current.naturalWidth
            ) + widgetSpacer;
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
      style={{
        minHeight: `${widgetSettings?.minHeight}px`,
        maxHeight: `${widgetSettings?.maxHeight}px`,
      }}
    >
      <div
        style={{ width: '100%', height: '100%', position: 'relative' }}
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
          widgetSettings={widgetSettings}
          wrapperEl={imgWrapperEl?.current}
          pictureOnly={pictureOnly}
          // quotes={
          //   interactionType === INTERACTION_ADD_OR_EDIT_QUOTE && !!activeQuote
          //     ? quotes.filter((quote) => quote.id !== activeQuote.quoteId)
          //     : quotes
          // }
        />

        <img className="turn-img" src={imageUrlToRender} ref={imgEl} />

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
    </div>
  );
};

export default Picture;

import { widgetSpacer as widgetSpacerOriginal } from '@/config/ui';
import { setPanelMode } from '@/modules/panels/redux/actions';
import {
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '@/config/panel';
import { useEffect, useState, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PictureCrop from './Crop';
import PictureQuotes from './Quotes';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { RULE_TURNS_CRUD } from '@/config/user';
import { TURN_SIZE_MIN_WIDTH } from '@/config/turn';
import { WIDGET_PICTURE } from '@/modules/turns/settings';

const Picture = ({
  registerHandleResize,
  unregisterHandleResize,
  turnId,
  pictureOnly = false, // @todo: сделать универсальную настройку
  widgetId,
}) => {
  const { can } = useUserContext();
  //
  const imageUrl = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId].url,
  );
  const widgetSpacer = pictureOnly ? 0 : widgetSpacerOriginal;

  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);

  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrlToRender, setImageUrlToRender] = useState(imageUrl);
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const editWidgetId = useSelector((state) => state.panels.editWidgetId);
  const mode = useSelector((state) => state.panels.mode);
  const editWidgetParams = useSelector(
    (state) => state.panels.editWidgetParams[`${editTurnId}_${editWidgetId}`],
  );

  const isActive = editTurnId === turnId && editWidgetId === widgetId;

  useEffect(() => {
    if (!imgEl.current) return;
    const loadImage = () => {
      if (imgEl && imgEl.current) {
        setImageLoaded(Date.now());
      }
    };

    const errorPicture = () => {
      setImageUrlToRender('/img/404.jpg');
    };

    imgEl.current.addEventListener('load', loadImage);
    imgEl.current.addEventListener('error', errorPicture);

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
      const heightCallback = (newWidth) => {
        if (!imgEl.current || !imgEl.current.naturalHeight) return 0;

        if (pictureOnly) {
          return Math.round(
            (imgEl.current.naturalHeight * newWidth) /
              imgEl.current.naturalWidth,
          );
        }

        const newImgHeight = Math.round(
          (imgEl.current.naturalHeight * (newWidth - 2 * widgetSpacer)) /
            imgEl.current.naturalWidth,
        );
        return newImgHeight;
      };
      registerHandleResize({
        type: WIDGET_PICTURE,
        id: widgetId,
        minWidthCallback: () => {
          return TURN_SIZE_MIN_WIDTH;
        },
        minHeightCallback: heightCallback,
        maxHeightCallback: heightCallback,
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
  }, [imageLoaded, pictureOnly]);

  return (
    <div className={`picture-content ${isActive ? 'active' : ''} turn-widget`}>
      <div className="w-full h-full relative" ref={imgWrapperEl}>
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
          wrapperEl={imageLoaded && imgWrapperEl?.current}
          pictureOnly={pictureOnly}
        />

        <img src={imageUrlToRender} ref={imgEl} />

        {can(RULE_TURNS_CRUD) && (
          <a
            className="widget-button"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              dispatch(
                setPanelMode({
                  mode: MODE_WIDGET_PICTURE,
                  params: { editTurnId: turnId, editWidgetId: widgetId },
                }),
              );
            }}
          >
            <i className="fas fa-highlighter"></i>
          </a>
        )}
      </div>
    </div>
  );
};

export default memo(Picture);

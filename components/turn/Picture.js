import { useEffect, useState, useRef } from 'react';
import { RULE_TURNS_CRUD } from '../config';
import turnSettings from './settings';
import ReactCrop from 'react-image-crop';
import {
  useInteractionContext,
  INTERACTION_ADD_OR_EDIT_QUOTE,
} from '../contexts/InteractionContext';
import { ACTION_PICTURE_QUOTE_COORDS_UPDATED } from '../contexts/TurnsCollectionContext';
import PictureQuotes from './picture/Quotes';
import { lineOffset } from '../сonst';

const getPercentage = (a, b) => {
  // выдаёт 4-й знак после запятой в процентах
  return Math.round((a * 1000000) / b) / 10000;
};

const Picture = ({
  turnId,
  allTurnQuotes,
  quotes,
  imageUrl,
  registerHandleResize,
  unregisterHandleResize,
  widgetId,
  widgetType,
  makeWidgetActive,
  isActive,
  interactionType,
  setInteractionMode,
  savePictureQuote,
  updatePictureQuote,
  dispatch,
  activeQuote,
  lineEnds,
}) => {
  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);
  const { actionsCallback } = useInteractionContext();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrlToRender, setImageUrlToRender] = useState(imageUrl);
  const [crop, setCrop] = useState({
    unit: '%',
    // x: 10,
    // y: 10,
    // width: 20,
    // height: 20,
  });

  // useEffect(() => {
  //   console.log({ crop });
  // }, [crop]);
  // { aspect: 16 / 9 });

  const quoteCoordinatesChanged = (quotes) => {
    if (!quotes.length) return;
    if (!imgEl) return;
    const newQuotes = quotes.map((quote) => {
      return {
        quoteId: quote.id,
        quoteKey: `${turnId}_${quote.id}`,
        type: quote.type,
        turnId,
        width: Math.round((quote.width * imgEl.current.width) / 100),
        height: Math.round((quote.height * imgEl.current.height) / 100),
        left: Math.round((quote.x * imgEl.current.width) / 100),
        top: Math.round(
          (quote.y * imgEl.current.height) / 100 +
            imgEl.current.parentElement.offsetTop // компенсация для header
        ),
        text: 'picture crop',
        position: 'default',
      };
    });
    // console.log({ newQuotes });
    dispatch({
      type: ACTION_PICTURE_QUOTE_COORDS_UPDATED,
      payload: { turnId, pictureQuotesInfo: newQuotes },
    });
  };

  useEffect(() => {
    // console.log('1', { allTurnQuotes });
    quoteCoordinatesChanged(
      allTurnQuotes.filter((quote) => quote.type === 'picture')
    );
  }, [allTurnQuotes]);

  useEffect(() => {
    if (!isActive) return;
    if (interactionType === INTERACTION_ADD_OR_EDIT_QUOTE) {
      // console.log('crop saved! ', crop);
      if (!crop.width || !crop.height) return;
      const width = getPercentage(crop.width, imgEl.current.width);
      const height = getPercentage(crop.height, imgEl.current.height);
      const x = getPercentage(crop.x, imgEl.current.width);
      const y = getPercentage(crop.y, imgEl.current.height);

      let id = Math.floor(new Date().getTime() / 1000);
      let updateFunction = savePictureQuote;

      if (!!activeQuote) {
        id = activeQuote.quoteId;
        updateFunction = updatePictureQuote;
      }

      updateFunction(
        {
          id,
          type: 'picture',
          x,
          y,
          height,
          width,
        },
        (...args) => {
          actionsCallback.func(...args);
          // console.log('2');
          // quoteCoordinatesChanged(
          //   allTurnQuotes.filter((quote) => quote.type === 'picture')
          // );
        }
      );
    }
    if (interactionType === INTERACTION_ADD_OR_EDIT_QUOTE) {
    }
  }, [actionsCallback]);

  useEffect(() => {
    if (isActive && interactionType === INTERACTION_ADD_OR_EDIT_QUOTE) {
      if (!!activeQuote) {
        const quote = quotes.find((quote) => quote.id === activeQuote.quoteId);
        const { x, y, height, width } = quote;
        setCrop({ unit: '%', x, y, width, height });
      } else {
        setCrop({
          unit: '%',
        });
      }
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
        resizeCallback: () => {
          // console.log('3');
          quoteCoordinatesChanged(quotes);
        },
      });
      // console.log('4');

      quoteCoordinatesChanged(quotes);
      // imgEl.current.addEventListener('resize', quoteCoordinCatesChanged);
    } else {
      if (!!imgEl.current && !!imgEl.current.complete) {
        // console.log('setImageLoaded(true)');
        setImageLoaded(true);
      }
    }
    return () => {
      unregisterHandleResize({ id: 'picture' });
      // !!imgEl.current &&
      //   imgEl.current.removeEventListener('resize', quoteCoordinatesChanged);
    }; // return callback будет вызван в момент unmountComponent()
  }, [imageLoaded]);

  return (
    <div
      className={`${isActive ? 'active' : ''} picture-content`}
      ref={imgWrapperEl}
    >
      {isActive && interactionType === INTERACTION_ADD_OR_EDIT_QUOTE && (
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

      <PictureQuotes
        turnId={turnId}
        quotes={
          interactionType === INTERACTION_ADD_OR_EDIT_QUOTE && !!activeQuote
            ? quotes.filter((quote) => quote.id !== activeQuote.quoteId)
            : quotes
        }
        dispatch={dispatch}
        activeQuote={activeQuote}
        lineEnds={lineEnds}
        setInteractionMode={setInteractionMode}
      />

      <img src={imageUrlToRender} ref={imgEl} />
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

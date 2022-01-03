import { useRef, useEffect } from 'react';
import { useTurnContext } from '../contexts/TurnContext';
import { ACTION_TURN_WAS_CHANGED } from '../contexts/TurnsCollectionContext';
import BottomLabels from './BottomLabels';
import Header from './Header';

const NextTurn = () => {
  const {
    turn,
    // zeroPoint,
    can,
    dispatch,
    lineEnds,
    activeQuote,
    // setCreateEditTurnPopupIsHidden, // @todo: remove
    // updateTurn,
    // deleteTurn,
    // saveTurnInBuffer,
    // addNotification,
    // tempMiddlewareFn,
    // lines,

    setInteractionMode,
  } = useTurnContext();

  const { _id, x, y, width, height } = turn;

  const {
    contentType,
    header,
    backgroundColor,
    fontColor,
    dontShowHeader,
    // imageUrl,
    // videoUrl,
    paragraph,
    sourceUrl,
    date,
    quotes,
    scrollPosition,
  } = turn;

  // @todo: также стили устанавливаются во время resize
  const wrapperStyles = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };

  // подключаем useRef к div хода
  const wrapper = useRef(null);
  const textPieces = []; // потом убрать

  useEffect(() => {
    $(wrapper.current).draggable({
      start: (event, ui) => {
        $('#gameBox')
          .addClass('remove-line-transition')
          .addClass('translucent-field');
      },
      drag: (event, ui) => {
        dispatch({
          type: ACTION_TURN_WAS_CHANGED,
          payload: {
            _id: _id,
            wasChanged: true,
            x: ui.position.left, // x - left - ui.position.left,
            y: ui.position.top, // y - top - ui.position.top,
          },
        });
      },
      stop: (event, ui) => {
        $('#gameBox')
          .removeClass('remove-line-transition')
          .removeClass('translucent-field');
      },
    });

    setTimeout(() => {
      dispatch({
        type: ACTION_TURN_WAS_CHANGED,
        payload: {
          _id: _id,
          wasChanged: true,
          width: 700,
          height: 400,
        },
      });
    }, 5000);

    return () => $(wrapper.current).draggable('destroy');
  }, []);

  return (
    <div
      ref={wrapper}
      className={`${contentType} react-turn-new ${
        dontShowHeader ? 'dont-show-header' : ''
      } ${!!textPieces.length ? 'compressed-turn' : ''}`}
      style={wrapperStyles}
    >
      <Header
        can={can}
        // handleClone={handleClone}
        // handleCut={handleCut}
        // handleEdit={handleEdit}
        // handleDelete={handleDelete}
        registerHandleResize={() => {}}
        // registerHandleResize={registerHandleResize}
      />
      {/* {!!imageUrl && (
        <Picture
          lineEnds={lineEnds}
          quotes={quotes.filter((quote) => quote.type === 'picture')} // поправить на переменную
          allTurnQuotes={quotes}
          imageUrl={imageUrl}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          widgetId="picture1"
          widgetType={WIDGET_PICTURE}
          isActive={isWidgetActive('picture1')} // (widgetId)
          interactionType={interactionType}
          setInteractionMode={setInteractionMode}
          dispatch={dispatch}
          turnId={_id}
          activeQuote={activeQuote}
          savePictureQuote={(pictureQuote, successCallback) => {
            const { x: zeroPointX, y: zeroPointY } = zeroPoint;
            const turnBody = {
              quotes: [...quotes, pictureQuote],
            };
            updateTurn(_id, turnBody, {
              successCallback: (data) => {
                dispatch({
                  type: ACTION_TURN_WAS_CHANGED,
                  payload: {
                    ...data.item,
                    x: data.item.x + zeroPointX,
                    y: data.item.y + zeroPointY,
                    quotes: data.item.quotes,
                  },
                });
                successCallback();
              },
            });
          }}
          updatePictureQuote={(pictureQuote, successCallback) => {
            // @todo: DRY
            const { x: zeroPointX, y: zeroPointY } = zeroPoint;
            const turnBody = {
              quotes: quotes.map((quote) => {
                if (quote.id === pictureQuote.id) {
                  return pictureQuote;
                } else return quote;
              }),
            };
            updateTurn(_id, turnBody, {
              successCallback: (data) => {
                dispatch({
                  type: ACTION_TURN_WAS_CHANGED,
                  payload: {
                    ...data.item,
                    x: data.item.x + zeroPointX,
                    y: data.item.y + zeroPointY,
                    quotes: data.item.quotes,
                  },
                });
                successCallback();
              },
            });
          }}
          makeWidgetActive={() => {
            setInteractionMode(MODE_WIDGET_PICTURE); // говорим набор кнопок для панели справа
            makeWidgetActive(_id, WIDGET_PICTURE, 'picture1'); // (turnId, widgetType, widgetId)
            // делаем синюю рамку у картинки
          }}
        />
      )} */}
      {/* {!!videoUrl && (
        <Video
          videoUrl={videoUrl}
          registerHandleResize={registerHandleResize}
          width={width}
        />
      )} */}
      {/* {!!textPieces.length && (
        <Compressor
          {...{
            textPieces,
            width,
            paragraph,
            paragraphTop: y + 40, // @todo: верх виджета параграфа под header, picture

            contentType,
            backgroundColor,
            fontColor,
            registerHandleResize,
            unregisterHandleResize,
            variableHeight,
            setCompressedHeight,
          }}
        />
      )} */}
      {/* {doesParagraphExist && (
        <Paragraph
          {...{
            setTextPieces, //
            contentType,
            backgroundColor,
            fontColor,
            paragraph,
            updateSizeTime, //
            registerHandleResize,
            unregisterHandleResize,
            variableHeight,
            quotes: quotes.filter((quote) => quote.type !== 'picture'), //@todo check
            dispatch, //
            _id, // @todo: оставить _id или turnId
            lineEnds, //
            activeQuote, //
            quotesWithCoords, //
            setQuotesWithCoords, //
            turnId: _id,
            quotesLoaded, //
            setQuotesLoaded, //
            scrollPosition,
            recalculateQuotes, //
            isActive: isWidgetActive('paragraph'), // (widgetId)
            makeWidgetActive: () => {
              setInteractionMode(MODE_WIDGET_PARAGRAPH); // говорим набор кнопок для панели справа
              makeWidgetActive(_id, WIDGET_PARAGRAPH, 'paragraph'); // (turnId, widgetType, widgetId)
              // делаем синюю рамку у картинки
            },
            compressedHeight,
            setCompressedHeight,

            turnSavePreviousHeight: () => setPrevHeight(height),
            turnReturnPreviousHeight: () => {
              dispatch({
                type: ACTION_TURN_WAS_CHANGED,
                payload: {
                  _id,
                  wasChanged: true,
                  // width: newTurnWidth,
                  height: prevHeight,
                },
              });
              // setCompressedHeight(null);
              $(wrapper.current).height(prevHeight);
              console.log(prevHeight);
              // setTimeout(() => {
              //   handleResize(width, prevHeight);
              // }, 2500);
            },
          }}
        />
      )} */}
      <BottomLabels
        {...{
          sourceUrl,
          date,
        }}
      />
      {/* <Telemetry id={_id} widgets={widgets} /> */}
    </div>
  );
};

export default NextTurn;

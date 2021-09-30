import { useEffect, useState, useRef } from 'react';
import Header from './Header';
import Picture from './Picture';
import Video from './Video';
import {
  ACTION_TURN_WAS_CHANGED,
  ACTION_SET_TURN_TO_EDIT_MODE,
  ACTION_DELETE_TURN,
} from '../contexts/TurnContext';
import Paragraph from './Paragraph';
import BottomLabels from './BottomLabels';
import Telemetry from './Telemetry';
import { dataCopy, fieldRemover } from '../helpers/formatters/dataCopier';

let timerId = null;
const delayRenderTurn = 20; // сколько времени ждём для анимации линий и цитат

const TurnNewComponent = ({
  turn,
  can,
  dispatch,
  lineEnds,
  activeQuote,
  setCreateEditTurnPopupIsHidden,
  deleteTurn,
  saveTurnInBuffer,
  getTurnFromBufferAndRemove,
}) => {
  const { _id, x, y, width, height } = turn;
  const {
    contentType,
    header,
    backgroundColor,
    fontColor,
    dontShowHeader,
    imageUrl,
    videoUrl,
    paragraph,
    sourceUrl,
    date,
    quotes,
    scrollPosition,
  } = turn;

  if (
    _id === '606c8c8253ab6a0017377983' ||
    _id === '6100ca06b1871a48ccce1849'
  ) {
    // console.log({ scrollPosition, header: header });
  }

  const wrapperStyles = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };

  // подключаем useRef к div хода
  const wrapper = useRef(null);

  const [widgets, setWidgets] = useState([]);
  const [updateSizeTime, setUpdateSizeTime] = useState(new Date().getTime());
  const [variableHeight, setVariableHeight] = useState(0);
  const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);

  const isParagraphExist = !!paragraph
    .map((item) => item.insert)
    .join('')
    .trim(); // @todo: remove after quill fix

  const registerHandleResize = (widget) => {
    setWidgets((widgets) => {
      const newWidgets = [...widgets];
      const index = newWidgets.findIndex(
        (newWidget) => newWidget.id === widget.id
      );
      if (index === -1) {
        newWidgets.push(widget);
      } else {
        newWidgets[index] = widget;
      }
      return newWidgets;
    });
  };

  const unregisterHandleResize = (widget) => {
    setWidgets((widgets) => {
      return widgets.filter(
        (widgetToReturn) => widget.id !== widgetToReturn.id
      );
    });
  };

  const recalculateQuotes = () => {
    // if (timerId) {
    //   // замедляем на 200мс update линий между цитатами
    //   clearTimeout(timerId);
    // }
    // timerId = setTimeout(() => {
    setQuotesLoaded(false);
    setQuotesWithCoords([]);
    setUpdateSizeTime(new Date().getTime());
    // }, delayRenderTurn);
  };

  // backgroundColor: null
  // contentType: "picture"
  // createdAt: "2021-09-14T04:47:01.089Z"
  // dontShowHeader: false
  // fontColor: null
  // gameId: "603bb95d8d996a07c82f2f4d"
  // header: "Новая цитата"
  // height: 86
  // paragraph: [{…}]
  // quotes: []
  // updatedAt: "2021-09-22T05:04:00.568Z"
  // videoUrl: null
  // wasChanged: true
  // width: 423.976
  // x: 1096.85546875
  // y: 537.890625

  const handleClone = async (e) => {
    e.preventDefault();
    const copiedTurn = dataCopy(turn);
    // @todo: проверить, откуда появляется _id в quotes
    copiedTurn.quotes = copiedTurn.quotes.map((quote) => ({
      id: quote.id,
      type: quote.type,
      text: quote.text, // @todo добавить это поле потом, сохранение по кнопке Save Turn
    }));
    const fieldsToKeep = [
      'header',
      'dontShowHeader',
      'imageUrl',
      'videoUrl',
      'date',
      'sourceUrl',
      'backgroundColor',
      'fontColor',

      'contentType',
      'paragraph',
      'quotes', // @todo: check
      'scrollPosition',
      'height',
      'width',
    ];
    fieldRemover(copiedTurn, fieldsToKeep); // передали {ход} и [сохраняемые поля]
    saveTurnInBuffer(copiedTurn); // сохранили turn в LocalStorage
  };

  const handleEdit = (e) => {
    e.preventDefault();
    dispatch({ type: ACTION_SET_TURN_TO_EDIT_MODE, payload: { _id } });
    setCreateEditTurnPopupIsHidden(false);
    // alert('button_edit_clicked');
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (confirm('Точно удалить?')) {
      // confirm - глобальная функция браузера
      deleteTurn(_id, {
        successCallback: () => {
          dispatch({ type: ACTION_DELETE_TURN, payload: { _id } });
          tempMiddlewareFn({ type: ACTION_DELETE_TURN, payload: { _id } });
        },
      });

      //alert('button_delete_clicked');
    }
  };

  const handleResize = (newTurnWidth, newTurnHeight, delay = 400) => {
    let minWidth = 0;
    let minHeight = 0;
    let maxHeight = 0;
    let minHeightBasic = 0;

    for (let widget of widgets) {
      if (minWidth < widget.minWidthCallback()) {
        minWidth = widget.minWidthCallback();
      }
    }

    if (newTurnWidth < minWidth) {
      newTurnWidth = minWidth;
    }

    for (let widget of widgets) {
      minHeight = minHeight + widget.minHeightCallback(newTurnWidth);
      maxHeight = maxHeight + widget.maxHeightCallback(newTurnWidth);
      if (!widget.variableHeight) {
        minHeightBasic =
          minHeightBasic + widget.minHeightCallback(newTurnWidth);
      }
    }

    if (newTurnHeight < minHeight) {
      newTurnHeight = minHeight;
    }
    if (newTurnHeight > maxHeight) {
      newTurnHeight = maxHeight;
    }

    $(wrapper.current).css({
      width: newTurnWidth,
      height: newTurnHeight,
    });
    setVariableHeight(newTurnHeight - minHeightBasic);
    dispatch({
      type: ACTION_TURN_WAS_CHANGED,
      payload: {
        _id,
        wasChanged: true,
        width: newTurnWidth,
        height: newTurnHeight,
      },
    });
    setTimeout(() => {
      recalculateQuotes();
    }, delay);
  };

  useEffect(() => {
    $(wrapper.current).resizable({
      // stop: (event, ui) => {
      resize: (event, ui) => {
        handleResize(ui.size.width, ui.size.height);
      },
    });
    return () => $(wrapper.current).resizable('destroy');
  }, [widgets]);

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
    return () => $(wrapper.current).draggable('destroy');
  }, []);

  useEffect(() => {
    if (widgets.length === 1 + !!imageUrl + !!videoUrl + isParagraphExist) {
      // setTimeout(() => {
      //   // console.log(header, 'handle resize');
      //   handleResize(width, height);
      //   // handleResize(width, height, 2000);
      //   // handleResize(width, height, 4000);
      // }, 400);
      handleResize(width, height);
    }
  }, [widgets]);

  return (
    <div
      ref={wrapper}
      className={`${contentType} react-turn-new ${
        dontShowHeader ? 'dont-show-header' : ''
      }`}
      style={wrapperStyles}
    >
      <Header
        style={
          contentType === 'comment' && !dontShowHeader
            ? { backgroundColor, color: fontColor || 'black' }
            : {}
        }
        can={can}
        header={header}
        handleClone={handleClone}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        registerHandleResize={registerHandleResize}
        dontShowHeader={dontShowHeader}
      />
      {!!imageUrl && (
        <Picture
          imageUrl={imageUrl}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
        />
      )}
      {!!videoUrl && (
        <Video
          videoUrl={videoUrl}
          registerHandleResize={registerHandleResize}
          width={width}
        />
      )}
      {isParagraphExist && (
        <Paragraph
          {...{
            contentType,
            backgroundColor,
            fontColor,
            paragraph,
            updateSizeTime,
            registerHandleResize,
            variableHeight,
            quotes,
            dispatch,
            _id,
            lineEnds,
            activeQuote,
            quotesWithCoords,
            setQuotesWithCoords,
            turnId: _id,
            quotesLoaded,
            setQuotesLoaded,
            scrollPosition,
            recalculateQuotes,
            unregisterHandleResize,
          }}
        />
      )}
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

export default TurnNewComponent;

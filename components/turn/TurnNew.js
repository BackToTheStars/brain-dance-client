import { useEffect, useState, useRef } from 'react';
import Header from './Header';
import Picture from './Picture';
import Video from './Video';
import { ACTION_TURN_WAS_CHANGED } from '../contexts/TurnContext';
import Paragraph from './Paragraph';
import BottomLabels from './BottomLabels';

let timerId = null;
const delayRenderTurn = 100; // сколько времени ждём для анимации линий и цитат

const TurnNewComponent = ({ turn, can, dispatch, lineEnds, activeQuote }) => {
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
      return [...widgets, widget];
    });
  };

  const recalculateQuotes = () => {
    if (timerId) {
      // замедляем на 200мс update линий между цитатами
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      setQuotesLoaded(false);
      setQuotesWithCoords([]);
      setUpdateSizeTime(new Date().getTime());
    }, delayRenderTurn);
  };

  const handleResize = (newTurnWidth, newTurnHeight) => {
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
    recalculateQuotes();
    console.log({ widgets });
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
      // start: (event, ui) => {},
      stop: (event, ui) => {
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
      // drag: (event, ui) => {},
    });
  }, []);

  useEffect(() => {
    if (widgets.length === 1 + !!imageUrl + !!videoUrl + isParagraphExist) {
      setTimeout(() => {
        handleResize(width, height);
      }, 100);
    }
  }, [widgets]);

  return (
    <div ref={wrapper} className="react-turn-new" style={wrapperStyles}>
      <Header
        style={
          contentType === 'comment' && !dontShowHeader
            ? { backgroundColor, color: fontColor || 'black' }
            : {}
        }
        can={can}
        header={header}
        handleEdit={null}
        handleDelete={null}
        registerHandleResize={registerHandleResize}
      />
      {!!imageUrl && (
        <Picture
          imageUrl={imageUrl}
          registerHandleResize={registerHandleResize}
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
            quotesLoaded,
            setQuotesLoaded,
            scrollPosition,
            recalculateQuotes,
          }}
        />
      )}
      <BottomLabels
        {...{
          sourceUrl,
          date,
        }}
      />
    </div>
  );
};

export default TurnNewComponent;

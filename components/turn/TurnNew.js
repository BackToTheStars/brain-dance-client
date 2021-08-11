import { useEffect, useState, useRef } from 'react';
import Header from './Header';
import Picture from './Picture';
import { ACTION_TURN_WAS_CHANGED } from '../contexts/TurnContext';

let handleResize = () => {}; // @todo: refactor

const TurnNewComponent = ({ turn, can, dispatch }) => {
  const { _id, x, y, width, height } = turn;
  const {
    contentType,
    header,
    backgroundColor,
    fontColor,
    dontShowHeader,
    imageUrl,
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

  const registerHandleResize = (widget) => {
    setWidgets([...widgets, widget]);
  };

  handleResize = (newTurnWidth, newTurnHeight) => {
    let minWidth = 0;
    let minHeight = 0;
    let maxHeight = 0;

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
    }

    if (newTurnHeight < minHeight) {
      newTurnHeight = minHeight;
    }
    if (newTurnHeight > maxHeight) {
      newTurnHeight = maxHeight;
    }

    console.log({ newTurnWidth, newTurnHeight });
    $(wrapper.current).css({ width: newTurnWidth, height: newTurnHeight });
    dispatch({
      type: ACTION_TURN_WAS_CHANGED,
      payload: {
        _id,
        wasChanged: true,
        width: newTurnWidth,
        height: newTurnHeight,
      },
    });
  };

  useEffect(() => {
    $(wrapper.current).resizable({
      stop: (event, ui) => {
        handleResize(ui.size.width, ui.size.height);
      },
    });
    return () => $(wrapper.current).resizable('destroy');
  }, []);

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
    </div>
  );
};

export default TurnNewComponent;

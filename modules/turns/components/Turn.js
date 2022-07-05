import {
  TURNS_GEOMETRY_TIMEOUT_DELAY,
  TURNS_POSITION_TIMEOUT_DELAY,
} from '@/config/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { updateGeometry } from '../redux/actions';
import { getQueue } from './helpers/queueHelper';
import { checkIfParagraphExists } from './helpers/quillHelper';
import { getTurnMinMaxHeight } from './helpers/sizeHelper';
import Header from './widgets/Header';
import DateAndSourceUrl from './widgets/header/DateAndSourceUrl';
import Paragraph from './widgets/paragraph/Paragraph';
import Picture from './widgets/picture/Picture';
import Video from './widgets/Video';

const turnGeometryQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);
const turnPositionQueue = getQueue(TURNS_POSITION_TIMEOUT_DELAY);

const Turn = ({ id }) => {
  const turn = useSelector((store) => store.turns.d[id]);
  const dispatch = useDispatch();

  const [widgets, setWidgets] = useState([]);
  const [widgetD, setWidgetD] = useState({});

  const wrapper = useRef(null);

  const {
    //-- geometry
    _id,
    x,
    y,
    width,
    height,
    //-- header
    header,
    contentType,
    backgroundColor,
    fontColor,
    dontShowHeader,
    sourceUrl,
    date,
    //-- paragraph
    paragraph, // contentType, dontShowHeader
    //-- video
    videoUrl,
    //-- image
    imageUrl,
  } = turn;

  const doesParagraphExist = checkIfParagraphExists(paragraph);

  const wrapperStyles = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };

  const registerHandleResize = useCallback(
    (widget) => {
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
    },
    [widgets]
  );

  const unregisterHandleResize = useCallback(
    (widget) => {
      setWidgets((widgets) => {
        return widgets.filter(
          (widgetToReturn) => widget.id !== widgetToReturn.id
        );
      });
    },
    [widgets]
  );

  const recalculateSize = (width, height) => {
    const { minHeight, maxHeight, minWidth, maxWidth, widgetD } =
      getTurnMinMaxHeight(widgets, width);

    const spaces = (widgets.length + 1) * 15;

    const newHeight = Math.min(Math.max(height, minHeight), maxHeight) + spaces;
    const newWidth = Math.min(Math.max(width, minWidth), maxWidth) + spaces;

    turnGeometryQueue.add(() => {
      dispatch(
        updateGeometry({
          _id,
          width: newWidth,
          height: newHeight,
        })
      );
    });

    if (newHeight !== height || newWidth !== width) {
      $(wrapper.current).css({
        height: `${newHeight}px`,
        width: `${newWidth}px`,
      });
    }
    const newWidgetD = {};
    const widgetIds = ['header1', 'video1', 'picture1', 'paragraph1'];

    let minTop = 0;
    let maxTop = 0;

    for (let widgetId of widgetIds) {
      if (!widgetD[widgetId]) continue;

      newWidgetD[widgetId] = {
        ...widgetD[widgetId],
        minTop,
        maxTop,
        width: newWidth,
      };

      minTop = minTop + widgetD[widgetId].minHeight;
      maxTop = maxTop + widgetD[widgetId].maxHeight;
    }

    setWidgetD(newWidgetD);
  };

  // DRAGGABLE
  useEffect(() => {
    $(wrapper.current).draggable({
      start: (event, ui) => {
        $('#gameBox')
          .addClass('remove-line-transition')
          .addClass('translucent-field');
      },
      drag: (event, ui) => {
        turnPositionQueue.add(() => {
          dispatch(
            updateGeometry({
              _id,
              x: ui.position.left, // x - left - ui.position.left,
              y: ui.position.top, // y - top - ui.position.top,
            })
          );
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

  // RESIZABLE
  useEffect(() => {
    $(wrapper.current).resizable({
      resize: (event, ui) => {
        recalculateSize(ui.size.width, ui.size.height);
      },
    });
    return () => $(wrapper.current).resizable('destroy');
  }, [widgets]);

  useEffect(() => {
    const widgetsCount =
      1 + // header
      !!imageUrl + // Picture
      !!videoUrl + // Video
      doesParagraphExist; // Paragraph

    if (widgetsCount === widgets.length) {
      recalculateSize(width, height);
    }
  }, [widgets]);

  // console.log({ widgets });

  return (
    <div
      ref={wrapper}
      className={`${contentType} react-turn-new ${
        dontShowHeader ? 'dont-show-header' : ''
      }`}
      style={wrapperStyles}
    >
      <Header
        registerHandleResize={registerHandleResize}
        // copyPasteActions={copyPasteActions}
        {...{
          header,
          contentType,
          backgroundColor,
          fontColor,
          dontShowHeader,
          _id,
          sourceUrl,
          date,
        }}
      />
      <div className="top-spaceholder" />
      {!!videoUrl && (
        <Video
          videoUrl={videoUrl}
          registerHandleResize={registerHandleResize}
          width={width}
        />
      )}
      {!!imageUrl && (
        <Picture
          imageUrl={imageUrl}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          widgetId="picture1"
          widgetType="picture"
          turnId={_id}
          widgetSettings={widgetD['picture1']}
        />
      )}
      {doesParagraphExist && (
        <Paragraph
          turn={turn}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
        />
      )}
      {dontShowHeader && !!date && !!sourceUrl && (
        <div className="bottom-date-and-sourceurl">
          <DateAndSourceUrl {...{ date, sourceUrl }} />
        </div>
      )}
    </div>
  );
};

export default Turn;

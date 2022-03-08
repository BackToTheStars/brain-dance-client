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
import Paragraph from './widgets/paragraph/Paragraph';
import Picture from './widgets/Picture';

const turnGeometryQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);
const turnPositionQueue = getQueue(TURNS_POSITION_TIMEOUT_DELAY);

const Turn = ({ id }) => {
  const turn = useSelector((store) => store.turns.d[id]);
  const dispatch = useDispatch();

  const [widgets, setWidgets] = useState([]);
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
    //-- paragraph
    paragraph, // contentType, dontShowHeader
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
        const { minHeight, maxHeight, minWidth, maxWidth } =
          getTurnMinMaxHeight(widgets, ui.size.width);

        const newHeight = Math.min(
          Math.max(ui.size.height, minHeight),
          maxHeight
        );
        const newWidth = Math.min(Math.max(ui.size.width, minWidth), maxWidth);

        turnGeometryQueue.add(() => {
          dispatch(
            updateGeometry({
              _id,
              width: newWidth,
              height: newHeight,
            })
          );
        });

        if (newHeight !== ui.size.height || newWidth !== ui.size.width) {
          $(wrapper.current).css({
            height: `${newHeight}px`,
            width: `${newWidth}px`,
          });
        }
      },
    });
    // return () => $(wrapper.current).resizable('destroy');
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
        registerHandleResize={registerHandleResize}
        // copyPasteActions={copyPasteActions}
        {...{
          header,
          contentType,
          backgroundColor,
          fontColor,
          dontShowHeader,
          _id,
        }}
      />
      {/* {!!imageUrl && (
        <Picture
          imageUrl={imageUrl}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          widgetId="picture1"
          widgetType="picture"
        />
      )} */}
      {doesParagraphExist && (
        <Paragraph
          turn={turn}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
        />
      )}
    </div>
  );
};

export default Turn;

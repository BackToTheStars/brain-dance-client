import {
  GRID_CELL_X,
  GRID_CELL_Y,
  TURNS_GEOMETRY_TIMEOUT_DELAY,
  TURNS_POSITION_TIMEOUT_DELAY,
  widgetSpacer,
} from '@/config/ui';
import { useCallback, useEffect, useRef, useState, memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import {
  changeTurnStage,
  markTurnAsChanged,
  resetCompressedParagraphState,
  // setParagraphIsReady,
  updateGeometry,
} from '../redux/actions';
import { TURN_WAS_CHANGED } from '../redux/types';
import turnSettings, {
  TURN_INIT,
  TURN_LOADING,
  TURN_LOADING_FIXED,
  TURN_READY,
} from '../settings';
import { getQueue } from './helpers/queueHelper';
import { checkIfParagraphExists } from './helpers/quillHelper';
import { getTurnMinMaxHeight } from './helpers/sizeHelper';
import { getParagraphStage, getTurnStage } from './helpers/stageHelper';
import Header from './widgets/Header';
import DateAndSourceUrl from './widgets/header/DateAndSourceUrl';
import Paragraph from './widgets/paragraph/Paragraph';
import {
  COMP_ACTIVE,
  COMP_LOADING,
  COMP_READY,
  COMP_READY_TO_RECEIVE_PARAMS,
  NOT_EXISTS,
  ORIG_ACTIVE,
  ORIG_LOADING,
  ORIG_READY,
  ORIG_READY_TO_RECEIVE_PARAMS,
} from './widgets/paragraph/settings';
import Picture from './widgets/picture/Picture';
import Video from './widgets/Video';
import { isSnapToGridSelector, snapRound } from './helpers/grid';
import ButtonsMenu from './widgets/header/ButtonsMenu';
import { Skeleton } from 'antd';

const turnGeometryQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);
const turnPositionQueue = getQueue(TURNS_POSITION_TIMEOUT_DELAY);

const TurnAdapter = ({ id }) => {
  const gamePosition = useSelector((state) => state.game.position);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();
  const wrapper = useRef(null);
  const position = useSelector((state) => state.turns.g[id].position);
  const size = useSelector((state) => state.turns.g[id].size);
  const loadStatus = useSelector(
    (state) => state.turns.d[id]?.loadStatus || 'not-loaded'
  );
  const contentType = useSelector((state) => state.turns.g[id].contentType);
  const { wrapperClasses, wrapperStyles } = useMemo(() => {
    const wrapperStyles = {
      position: 'absolute',
      left: `${position.x - (gamePosition.x || 0)}px`, // @fixme: update for storybook
      top: `${position.y - (gamePosition.y || 0)}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
    };

    const wrapperClasses = [
      `turn_${id}`,
      contentType,
      'react-turn-new',
      'noselect',
    ].join(' ');
    return {
      wrapperClasses,
      wrapperStyles,
    };
  }, [gamePosition, position, size, isDragging]);

  // DRAGGABLE
  useEffect(() => {
    if (typeof $ === 'undefined') return;
    $(wrapper.current).draggable({
      // grid: [GRID_CELL_X, GRID_CELL_X],
      start: (event, ui) => {
        setIsDragging(true);
        $('#gameBox')
          .addClass('remove-line-transition')
          .addClass('translucent-field');
      },
      drag: (event, ui) => {
        turnPositionQueue.add(() => {
          dispatch(
            updateGeometry({
              _id: id,
              position: {
                x: Math.round(ui.position.left + gamePosition.x),
                y: Math.round(ui.position.top + gamePosition.y),
              },
              // x: ui.position.left, // x - left - ui.position.left,
              // y: ui.position.top, // y - top - ui.position.top,
            })
          );
        });
      },
      stop: (event, ui) => {
        turnPositionQueue.clear();
        dispatch(
          updateGeometry({
            _id: id,
            position: {
              x: Math.round((ui.position.left + gamePosition.x) / GRID_CELL_X) * GRID_CELL_X,
              y: Math.round((ui.position.top + gamePosition.y) / GRID_CELL_X) * GRID_CELL_X,
            },
          })
        );
        setIsDragging(false);
        $('#gameBox')
          .removeClass('remove-line-transition')
          .removeClass('translucent-field');
        dispatch(markTurnAsChanged({ _id: id }));
      },
      cancel: '.not-draggable',
    });

    return () => $(wrapper.current).draggable('destroy');
  }, [gamePosition]);

  return (
    <div style={wrapperStyles} className={wrapperClasses} ref={wrapper}>
      {loadStatus === 'loaded' ? <Turn id={id} /> : <Skeleton active />}
    </div>
  );
};

const Turn = memo(({ id }) => {
  const turnData = useSelector((state) => state.turns.d[id].data);
  const size = useSelector((state) => state.turns.g[id].size);
  const isSnapToGrid = true; // useSelector(isSnapToGridSelector); // @fixme: update for storybook
  const dispatch = useDispatch();

  const [widgets, setWidgets] = useState([]);
  const [widgetD, setWidgetD] = useState({});

  const wrapper = useRef(null);

  const { width, height } = size;
  const {
    //-- geometry
    // position,
    _id,
    colors: { background, font },
    // size: { width, height },
    //-- header
    contentType,
    // backgroundColor,
    // dontShowHeader: dontShowHeaderOriginal,
    //-- paragraph
    dWidgets: {
      p_1: { inserts: paragraph },
      i_1: { url: imageUrl },
      v_1: { url: videoUrl },
      h_1: { show: headerShow },
      s_1: { url: sourceUrl, date, show: sourceShow },
    },
    // paragraph, // contentType, dontShowHeader
    compressed,
    //-- image
    pictureOnly,
    // states
    wasChanged,
  } = turnData;

  const dontShowHeaderOriginal = !headerShow;

  const paragraphStage = getParagraphStage(turnData);
  const turnStage = getTurnStage(turnData);

  const dontShowHeader = pictureOnly || dontShowHeaderOriginal;

  const doesParagraphExist = !pictureOnly && checkIfParagraphExists(paragraph);

  const wrapperStyles = {
    width: '100%',
    height: '100%',
  };

  if (!!background && contentType === turnSettings.TEMPLATE_COMMENT) {
    wrapperStyles.backgroundColor = background;
  }

  const widgetsCount =
    !dontShowHeader + // header
    !!imageUrl + // Picture
    !!videoUrl + // Video
    doesParagraphExist; // Paragraph
  const notRegisteredWidgetsCount = widgetsCount - widgets.length;

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
    const {
      minHeight,
      maxHeight,
      minWidth,
      maxWidth,
      widgetD,
      desiredHeight,
      minHeightBasic,
    } = getTurnMinMaxHeight(widgets, width);

    let newHeight = Math.round(
      Math.min(Math.max(height, minHeight), maxHeight) + widgetSpacer // @todo: для компрессора проверить
    );
    if (paragraphStage === ORIG_READY || paragraphStage === COMP_READY) {
      newHeight = widgets
        .find((w) => w.variableHeight)
        .getDesiredTurnHeight({
          minHeightBasic,
          newHeight,
          minHeight,
          maxHeight,
        });
    }
    const newWidth = Math.round(Math.min(Math.max(width, minWidth), maxWidth)); //+ widgetSpacer;

    const isLocked = // transition from compressed to uncompressed
      paragraphStage === ORIG_LOADING &&
      turnData.paragraphStages.at(-3) === COMP_READY;

    if (!isLocked) {
      turnGeometryQueue.add(() => {
        dispatch(
          updateGeometry({
            _id,
            size: {
              width: newWidth,
              height: newHeight,
            },
            [compressed ? 'compressedHeight' : 'uncompressedHeight']: newHeight,
          })
        );
      });

      if (typeof $ !== 'undefined') {
        if (newHeight !== height || newWidth !== width) {
          $(wrapper.current).css({
            height: `${newHeight}px`,
            width: `${newWidth}px`,
          });
        }
      }
    }

    const newWidgetD = {};
    const widgetIds = ['header1', 'video1', 'i_1', 'p_1']; // позже перенести

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

  useEffect(() => {
    if (turnStage === TURN_LOADING_FIXED) {
      if (paragraphStage === ORIG_READY_TO_RECEIVE_PARAMS) {
        // @todo: проверить необходимо ли передать высоту
        dispatch(
          changeTurnStage(_id, TURN_READY, { paragraphStage: ORIG_READY })
        );
      }
      if (paragraphStage === COMP_READY_TO_RECEIVE_PARAMS) {
        dispatch(
          changeTurnStage(_id, TURN_READY, { paragraphStage: COMP_READY })
        );
      }
    }
  }, [turnStage, paragraphStage]);

  // RESIZABLE
  useEffect(() => {
    if (paragraphStage === COMP_READY) return;
    if (typeof $ === 'undefined') return;

    $(wrapper.current).resizable({
      grid: [GRID_CELL_X, GRID_CELL_Y],
      resize: (event, ui) => {
        if (notRegisteredWidgetsCount === 0) {
          isSnapToGrid
            ? recalculateSize(
                snapRound(ui.size.width, GRID_CELL_X),
                snapRound(ui.size.height, GRID_CELL_Y)
              )
            : recalculateSize(
                Math.round(ui.size.width),
                Math.round(ui.size.height)
              );
          dispatch(markTurnAsChanged({ _id }));
        }
      },
    });
    return () => {
      $(wrapper.current).resizable('destroy');
    };
  }, [widgets, turnStage]);

  useEffect(() => {
    dispatch(resetCompressedParagraphState(_id));
  }, [width]); // @todo: проверить, необходимо ли перенести это в Compressor

  useEffect(() => {
    if (!wrapper.current) return;
    if (typeof $ === 'undefined') return;
    if (paragraphStage === COMP_READY) {
      $(wrapper.current).resizable({ disabled: true });
    } // @todo: else if previous paragraphStage === COMP_READY then enable
  }, [paragraphStage]);

  useEffect(() => {
    // if (callsQueueIsBlockedFlag) return;

    if (notRegisteredWidgetsCount === 0) {
      recalculateSize(Math.round(width), Math.round(height));
      // setStateIsReady(true);
      dispatch(changeTurnStage(_id, TURN_LOADING_FIXED));
    }
  }, [
    widgets,
    // callsQueueIsBlockedFlag
  ]);

  useEffect(() => {
    dispatch(changeTurnStage(_id, TURN_LOADING));
  }, []);

  // console.log({ widgets });

  const wrapperClasses = [
    // contentType,
    'react-turn-new',
    'react-turn-new_size',
    // 'noselect',
    // classNameId,
  ];

  if (dontShowHeader) {
    wrapperClasses.push('dont-show-header');
  }
  if (pictureOnly) {
    wrapperClasses.push('picture-only');
  }

  if (wasChanged) {
    wrapperClasses.push('was-changed');
  }

  return (
    <div
      ref={wrapper}
      className={wrapperClasses.join(' ')}
      style={wrapperStyles}
    >
      {!dontShowHeader && (
        <Header
          widgetId={'h_1'}
          registerHandleResize={registerHandleResize}
          _id={_id}
        />
      )}
      {!!videoUrl && (
        <Video
          // videoUrl={videoUrl}
          widgetId={'v_1'}
          registerHandleResize={registerHandleResize}
          turnId={_id}
          // width={width}
        />
      )}
      {!!imageUrl && (
        <Picture
          // imageUrl={imageUrl}
          widgetId={'i_1'}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          widgetType="picture"
          turnId={_id}
          widgetSettings={widgetD['i_1']}
          pictureOnly={pictureOnly}
        />
      )}
      {doesParagraphExist && (
        <Paragraph
          turnId={_id}
          widgetId={'p_1'}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          widget={widgetD['p_1']}
          notRegisteredWidgetsCount={notRegisteredWidgetsCount}
        />
      )}
      <ButtonsMenu _id={_id} />
      {sourceShow && (
        <div className="bottom-date-and-sourceurl">
          <DateAndSourceUrl {...{ widgetId: 's_1', date, sourceUrl }} />
        </div>
      )}
    </div>
  );
});

export default memo(TurnAdapter);

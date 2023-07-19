import {
  GRID_CELL_X,
  GRID_CELL_Y,
  TURNS_GEOMETRY_TIMEOUT_DELAY,
  TURNS_POSITION_TIMEOUT_DELAY,
  widgetSpacer,
} from '@/config/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useDevPanel } from '@/modules/panels/components/hooks/useDevPanel';
import { isSnapToGridSelector, snapRound } from './helpers/grid';

const turnGeometryQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);
const turnPositionQueue = getQueue(TURNS_POSITION_TIMEOUT_DELAY);

const getParagraphHeightOld = ({
  widgetId,
  widgetD,
  compressed,
  paragraphIsReady,
  compressedHeight,
}) => {
  const widget = widgetD[widgetId];
  if (!widget) return 0;
  const { minHeight, maxHeight } = widget;
  if (!compressed) return 0;

  // ветка для Compressed Paragraph
  if (paragraphIsReady) {
    // параграф уже готов
    // ещё выясняем первоначальную высоту параграфа
    if (!!compressedHeight) {
      // есть сохранённая высота
      let paragraphHeight = compressedHeight;
      for (const key in widgetD) {
        if (key === widgetId) continue;
        paragraphHeight = paragraphHeight - widgetD[key].minHeight;
      }
      // compressedHeight:3000
      // minHeight:2000
      // maxHeight:8000
      if (minHeight <= compressedHeight && compressedHeight <= maxHeight) {
        return paragraphHeight;
      }

      // compressedHeight:1000
      // minHeight:2000
      // maxHeight:8000
      if (compressedHeight <= minHeight)
        return paragraphHeight - (minHeight - compressedHeight);

      // compressedHeight:9000
      // minHeight:2000
      // maxHeight:8000
      if (compressedHeight >= maxHeight)
        return paragraphHeight - (maxHeight - compressedHeight);
    } else {
      // до этого момента параграф не сжимался
      return widget.minHeight;
    }
  } else {
    // ещё выясняем первоначальную высоту параграфа
    if (!!compressedHeight) {
      // есть сохранённая высота
      let paragraphHeight = compressedHeight;
      for (const key in widgetD) {
        if (key === widgetId) continue;
        paragraphHeight = paragraphHeight - widgetD[key].minHeight;
      }
      // compressedHeight:3000
      // minHeight:2000
      // maxHeight:8000
      if (minHeight <= compressedHeight && compressedHeight <= maxHeight) {
        return paragraphHeight;
      }

      // compressedHeight:1000
      // minHeight:2000
      // maxHeight:8000
      if (compressedHeight <= minHeight)
        return paragraphHeight - (minHeight - compressedHeight);

      // compressedHeight:9000
      // minHeight:2000
      // maxHeight:8000
      if (compressedHeight >= maxHeight)
        return paragraphHeight - (maxHeight - compressedHeight);
    } else {
      // до этого момента параграф не сжимался
      return widget.minHeight;
    }
  }
};

const Turn = ({ id }) => {
  const turn = useSelector((state) => state.turns.d[id]);
  const isSnapToGrid = useSelector(isSnapToGridSelector);
  const dispatch = useDispatch();

  const [widgets, setWidgets] = useState([]);
  const [widgetD, setWidgetD] = useState({});

  const wrapper = useRef(null);

  const {
    //-- geometry
    size,
    position,
    _id,
    x,
    y,
    size: { width, height },
    //-- header
    contentType,
    backgroundColor,
    // dontShowHeader: dontShowHeaderOriginal,
    //-- paragraph
    dWidgets: {
      p_1: { inserts: paragraph },
      i_1: { url: imageUrl },
      v_1: { url: videoUrl },
      h_1: { show: headerShow },
      s_1: { url: sourceUrl, date },
    },
    // paragraph, // contentType, dontShowHeader
    compressed,
    //-- image
    pictureOnly,
    // states
    wasChanged,
  } = turn;

  // console.log(turn.dWidgets.p_1.inserts, paragraph);

  const dontShowHeaderOriginal = !headerShow;

  const paragraphStage = getParagraphStage(turn);
  const turnStage = getTurnStage(turn);

  // const callsQueueIsBlockedFlag = useSelector(
  //   (state) => state.ui.callsQueueIsBlocked
  // );

  // const dispatchParagraphIsReady = (value) => {
  //   dispatch(setParagraphIsReady(_id, value));
  // };

  const dontShowHeader = pictureOnly || dontShowHeaderOriginal;

  const doesParagraphExist = !pictureOnly && checkIfParagraphExists(paragraph);

  const wrapperStyles = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
  };

  if (!!backgroundColor && contentType === turnSettings.TEMPLATE_COMMENT) {
    wrapperStyles.backgroundColor = backgroundColor;
  }

  const classNameId = `turn_${_id}`;

  const { isDeveloperModeActive, setDevItem } = useDevPanel();

  const widgetsCount =
    1 + // header
    !!imageUrl + // Picture
    !!videoUrl + // Video
    doesParagraphExist; // Paragraph
  const notRegisteredWidgetsCount = widgetsCount - widgets.length;

  if (isDeveloperModeActive) {
    setDevItem({
      itemType: 'turn',
      id: _id,
      params: { x, y, w: width, h: height, selector: `.${classNameId}` },
      parentType: 'window',
      parentId: '0',
    });
    // setDevItem = (itemType, id, params, parentType, parentId) => {
  }

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

    // @todo: desiredHeight > minHeight
    // if (desiredHeight >= minHeight && desiredHeight <= maxHeight) {
    //   newHeight = desiredHeight;
    // }

    const newWidth = Math.round(Math.min(Math.max(width, minWidth), maxWidth)); //+ widgetSpacer;;

    // if (paragraphStage !== ORIG_LOADING) {
    //  && paragraphStage !== COMP_LOADING) {

    const isLocked = // transition from compressed to uncompressed
      paragraphStage === ORIG_LOADING &&
      turn.paragraphStages.at(-3) === COMP_READY;

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
    const widgetIds = ['header1', 'video1', 'picture1', 'paragraph1']; // позже перенести

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

  // DRAGGABLE
  useEffect(() => {
    if (typeof $ === 'undefined') return;
    $(wrapper.current).draggable({
      grid: [GRID_CELL_X, GRID_CELL_X],
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
              position: { x: ui.position.left, y: ui.position.top },
              // x: ui.position.left, // x - left - ui.position.left,
              // y: ui.position.top, // y - top - ui.position.top,
            })
          );
        });
      },
      stop: (event, ui) => {
        $('#gameBox')
          .removeClass('remove-line-transition')
          .removeClass('translucent-field');
        dispatch(markTurnAsChanged({ _id }));
      },
    });

    return () => $(wrapper.current).draggable('destroy');
  }, []);

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
    contentType,
    'react-turn-new',
    'noselect',
    classNameId,
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
      <Header
        widgetId={'h_1'}
        registerHandleResize={registerHandleResize}
        _id={_id}
      />
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
          widgetSettings={widgetD['picture1']}
          pictureOnly={pictureOnly}
        />
      )}
      {doesParagraphExist && (
        <Paragraph
          turnId={_id}
          widgetId={'p_1'}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          // stateIsReady={stateIsReady}
          widget={widgetD['paragraph1']}
          notRegisteredWidgetsCount={notRegisteredWidgetsCount}
          // paragraphIsReady={paragraphIsReady}
          // setParagraphIsReady={dispatchParagraphIsReady}
          // height={getParagraphHeight({
          //   widgetId: 'paragraph1',
          //   widgetD,
          //   compressed,
          //   paragraphIsReady: paragraphStage === COMP_READY,
          //   compressedHeight,
          // })}
        />
      )}
      {dontShowHeader && !!date && !!sourceUrl && (
        <div className="bottom-date-and-sourceurl">
          <DateAndSourceUrl {...{ widgetId: 's_1', date, sourceUrl }} />
        </div>
      )}
    </div>
  );
};

export default Turn;

import {
  GRID_CELL_X,
  GRID_CELL_Y,
  TURNS_GEOMETRY_TIMEOUT_DELAY,
  TURNS_POSITION_TIMEOUT_DELAY,
  widgetSpacer,
} from '@/config/ui';
import { useCallback, useEffect, useRef, useState, memo, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import {
  recalcAreaRect,
  updateGeometry,
  updateSplitHeight,
} from '../redux/actions';
import turnSettings, {
  WIDGET_AUDIO_QUOTES,
  WIDGET_PARAGRAPH,
  WIDGET_PDF,
  WIDGET_VIDEO_QUOTES,
} from '../settings';
import { getQueue } from './helpers/queueHelper';
import { getScrollbarColor } from './helpers/color';
import { checkIfParagraphExists } from './helpers/quillHelper';
import { getTurnMinMaxHeight } from './helpers/sizeHelper';
import Header from './widgets/Header';
import DateAndSourceUrl from './widgets/header/DateAndSourceUrl';
import Paragraph from './widgets/paragraph/Paragraph';
import Pdf from './widgets/pdf/Pdf';
import Picture from './widgets/picture/Picture';
import Video from './widgets/video/Video';
import { snapRound } from './helpers/grid';
import ButtonsMenu from './widgets/header/ButtonsMenu';
import { TurnStateProvider } from './TurnState';
import { TURN_SIZE_MAX_WIDTH, TURN_SIZE_MIN_WIDTH } from '@/config/turn';
import Audio from './widgets/audio/Audio';
import TimelineQuotes from './widgets/timeline/Quotes';
import { MediaPlaybackProvider } from './widgets/media/PlaybackContext';
import { TID } from '@/config/testIds';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { HorizontalSplit } from '@/modules/ui/components/common/HorizontalSplit';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { mouseTravel } from '@/modules/game/components/helpers/zoom';

const TIMELINE_TYPES = [WIDGET_AUDIO_QUOTES, WIDGET_VIDEO_QUOTES];

// Очереди — на карточку, а не на модуль. Общая очередь отменяла отложенный вызов
// предыдущей карточки (`getQueue.add` делает clearTimeout), поэтому при первом рендере
// обновления геометрии почти всех ходов терялись: DOM внутренней карточки уже был
// пересчитан по контенту, а в сторе (и во внешнем контейнере, к которому привязан блок
// источника) оставалась высота с бэкенда.
const TurnAdapter = ({ id }) => {
  const turnPositionQueue = useRef(getQueue(TURNS_POSITION_TIMEOUT_DELAY)).current;
  const gamePosition = useSelector((state) => state.game.position);
  const dispatch = useDispatch();
  const store = useStore();
  const wrapper = useRef(null);
  const position = useSelector((state) => state.turns.g[id].position);
  const width = useSelector((state) => state.turns.g[id].size?.width);
  const height = useSelector((state) => state.turns.g[id].size?.height);
  const contentType = useSelector((state) => state.turns.g[id].contentType);
  // While I follow a tour the card is not dragged (the follower only watches);
  // it is still scrolled and played, so the draggable is simply not created
  // rather than disabled — jQuery UI's `disable` would take the pointer away.
  const following = useSelector(selectFollowing);
  // A viewer (no RULE_TURNS_CRUD) gets the same treatment by role.
  const { can } = useUserContext();
  const isViewer = !can(RULE_TURNS_CRUD);
  const restricted = following || isViewer;
  const { wrapperClasses, wrapperStyles } = useMemo(() => {
    const wrapperStyles = {
      left: `${position.x - (gamePosition.x || 0)}px`,
      top: `${position.y - (gamePosition.y || 0)}px`,
      width: `${width}px`,
      height: `${height}px`,
    };

    // Without a draggable of its own the card would hand the mousedown to the
    // board, and dragging a card would drag the whole canvas.
    const wrapperClasses = ['stb-react-turn', `turn_${id}`, contentType]
      .concat(restricted ? 'not-draggable' : [])
      .join(' ');
    return {
      wrapperClasses,
      wrapperStyles,
    };
  }, [gamePosition, position, width, height, restricted]);

  // DRAGGABLE
  useEffect(() => {
    if (typeof $ === 'undefined') return;
    if (restricted) return;
    let origin = null;
    let travel = null;
    const follow = (event, ui) => {
      if (!travel) return;
      const { x, y } = travel(event);
      ui.position.left = origin.left + x;
      ui.position.top = origin.top + y;
    };
    $(wrapper.current).draggable({
      // grid: [GRID_CELL_X, GRID_CELL_X],
      start: (event, ui) => {
        const { style } = wrapper.current;
        origin = {
          left: parseFloat(style.left) || 0,
          top: parseFloat(style.top) || 0,
        };
        travel = mouseTravel(store.getState().game.zoom, event);
        $('#game-box')
          .addClass('remove-line-transition')
          .addClass('translucent-field');
      },
      drag: (event, ui) => {
        follow(event, ui);
        turnPositionQueue.add(() => {
          dispatch(
            updateGeometry({
              _id: id,
              position: {
                x: Math.round(ui.position.left + gamePosition.x),
                y: Math.round(ui.position.top + gamePosition.y),
              },
            })
          );
        });
      },
      stop: (event, ui) => {
        follow(event, ui);
        turnPositionQueue.clear();
        dispatch(
          updateGeometry({
            _id: id,
            position: {
              x:
                Math.round((ui.position.left + gamePosition.x) / GRID_CELL_X) *
                GRID_CELL_X,
              y:
                Math.round((ui.position.top + gamePosition.y) / GRID_CELL_X) *
                GRID_CELL_X,
            },
          })
        );
        dispatch(recalcAreaRect());
        $('#game-box')
          .removeClass('remove-line-transition')
          .removeClass('translucent-field');
      },
      cancel: ".not-draggable",
    });

    return () => $(wrapper.current).draggable('destroy');
  }, [gamePosition, restricted]);

  return (
    <div
      style={wrapperStyles}
      className={wrapperClasses}
      data-test-id={TID.turnCard}
      data-turn-id={id}
      ref={wrapper}
    >
      <TurnStateProvider id={id} />
    </div>
  );
};

export const Turn = memo(({ id }) => {
  const turnData = useSelector((state) => state.turns.d[id]);
  const dispatch = useDispatch();
  const store = useStore();
  const turnGeometryQueue = useRef(getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY)).current;

  const turnWidth = useSelector((state) => state.turns.g[id]?.size?.width);
  const following = useSelector(selectFollowing);
  // A viewer (no RULE_TURNS_CRUD) is blocked the same way as a follower: no
  // resize, no split handle.
  const { can } = useUserContext();
  const restricted = following || !can(RULE_TURNS_CRUD);

  const [widgets, setWidgets] = useState([]);
  const [splitDragging, setSplitDragging] = useState(false);
  const wrapper = useRef(null);
  const splitDrag = useRef(null);

  const {
    _id,
    colors: { background },
    contentType,
    updatedAt,
    dWidgets: {
      p_1: { inserts: paragraph },
      i_1: { url: imageUrl },
      v_1: { url: videoUrl },
      vq_1: { quotes: videoSegments },
      aq_1: { quotes: audioSegments },
      a_1: { url: audioUrl },
      // pdf_1 — защитный дефолт на случай отсутствия в dWidgets
      pdf_1: { url: pdfUrl } = {},
      h_1: { show: headerShow },
      s_1: { url: sourceUrl, date, show: sourceShow },
    },
    pictureOnly,
    splitHeight,
  } = useMemo(() => {
    return turnData;
  }, [turnData]);

  const dontShowHeader = useMemo(
    () => pictureOnly || !headerShow,
    [pictureOnly, headerShow]
  );

  const doesParagraphExist = useMemo(
    () => !pictureOnly && checkIfParagraphExists(paragraph),
    [paragraph, pictureOnly]
  );

  const hasVideoQuotes = useMemo(
    () => videoSegments.some((segment) => segment.active),
    [videoSegments]
  );
  const hasAudioQuotes = useMemo(
    () => audioSegments.some((segment) => segment.active),
    [audioSegments]
  );

  const widgetsCount = useMemo(() => {
    return (
      !dontShowHeader + // header
      !!imageUrl + // Picture
      !!videoUrl + // Video
      hasVideoQuotes + // Video quotes
      hasAudioQuotes + // Audio quotes
      !!audioUrl + // Audio
      !!pdfUrl + // Pdf
      doesParagraphExist
    ); // Paragraph
  }, [
    dontShowHeader,
    imageUrl,
    videoUrl,
    hasVideoQuotes,
    hasAudioQuotes,
    audioUrl,
    pdfUrl,
    doesParagraphExist,
  ]);

  const { resizeDisabled, widgetsUpdatedTime } = useMemo(() => {
    return {
      resizeDisabled: widgets.some((widget) => widget.resizeDisabled),
      widgetsUpdatedTime: widgetsCount === widgets.length ? Date.now() : null,
    };
  }, [widgets, widgetsCount]);

  // РАЗДЕЛИТЕЛЬ ВЫСОТЫ
  // Пара резиновых виджетов в карточке одна — pdf над абзацем, только они делят
  // остаток. У картинки высота от пропорции, делить ей нечего.
  const splitPair = useMemo(() => {
    if (resizeDisabled) return null;
    const top = widgets.find((widget) => widget.type === WIDGET_PDF);
    const bottom = widgets.find((widget) => widget.type === WIDGET_PARAGRAPH);
    return top && bottom ? { top, bottom } : null;
  }, [widgets, resizeDisabled]);

  // Верх стоит на своей высоте, но не выше самого документа: иначе под
  // последней страницей повисла бы пустота.
  const splitTop = useMemo(() => {
    if (!splitPair || !splitHeight) return null;
    return Math.min(splitHeight, splitPair.top.maxHeightCallback(turnWidth));
  }, [splitPair, splitHeight, turnWidth]);

  const onSplitDragging = useCallback(
    (isDragging) => {
      setSplitDragging(isDragging);
      if (!isDragging || !splitPair) return;
      const top = wrapper.current?.querySelector('.stb-widget-pdf');
      const bottom = wrapper.current?.querySelector('.stb-widget-paragraph');
      if (!top || !bottom) return;
      // Замеренная высота пары и есть тот остаток, который делит перетаскивание:
      // высота карточки от него не меняется.
      const pairHeight = top.offsetHeight + bottom.offsetHeight;
      const min = splitPair.top.minHeightCallback(turnWidth);
      splitDrag.current = {
        zoom: store.getState().game.zoom,
        start: top.offsetHeight,
        min,
        max: Math.max(
          min,
          Math.min(
            splitPair.top.maxHeightCallback(turnWidth),
            pairHeight - splitPair.bottom.minHeightCallback(turnWidth),
          ),
        ),
      };
    },
    [splitPair, turnWidth],
  );

  const onSplitMove = useCallback(
    (delta) => {
      if (!splitDrag.current) return;
      const { zoom, start, min, max } = splitDrag.current;
      dispatch(
        updateSplitHeight({
          _id,
          splitHeight: Math.min(
            Math.max(start + Math.round(delta / zoom), min),
            max,
          ),
        }),
      );
    },
    [_id],
  );

  const wrapperStyles = useMemo(() => {
    const wrapperStyles = {};

    if (!!background && contentType === turnSettings.TEMPLATE_COMMENT) {
      wrapperStyles.backgroundColor = background;
      // полоса прокрутки абзаца — от того же фона, что и карточка
      wrapperStyles['--turn-scrollbar-color'] = getScrollbarColor(background);
    }
    if (splitTop) {
      wrapperStyles['--turn-split-top'] = `${splitTop}px`;
      wrapperStyles['--turn-split-bottom-min'] =
        `${splitPair.bottom.minHeightCallback(turnWidth)}px`;
    }
    return wrapperStyles;
  }, [background, contentType, splitTop, splitPair, turnWidth]);

  const wrapperClasses = useMemo(() => {
    const wrapperClasses = ['stb-react-turn__inner'];

    if (pictureOnly) {
      wrapperClasses.push('picture-only');
    }

    if (splitTop) {
      wrapperClasses.push('has-split');
    }

    if (splitDragging) {
      wrapperClasses.push('split-dragging');
    }

    return wrapperClasses.join(' ');
  }, [pictureOnly, splitTop, splitDragging]);

  // Ряды ленты цитат добавляют карточке свою высоту (появление ленты — и зазор между виджетами),
  // а не отнимают её у абзаца. Учёт — вне updater'а setWidgets: StrictMode зовёт его дважды.
  const timelineHeights = useRef({});
  const timelineGrowth = useRef(0);
  const sized = useRef(false);
  const trackTimeline = (id, height) => {
    const prev = timelineHeights.current[id] || 0;
    if (height) timelineHeights.current[id] = height;
    else delete timelineHeights.current[id];
    if (!sized.current) return;
    let delta = height - prev;
    if (!prev && height) delta += widgetSpacer;
    if (prev && !height) delta -= widgetSpacer;
    timelineGrowth.current += delta;
  };

  const registerHandleResize = useCallback(
    (widget) => {
      if (TIMELINE_TYPES.includes(widget.type)) {
        trackTimeline(widget.id, widget.minHeightCallback());
      }
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

  // Виджеты зовут с объектом (`{ id }`), параграфные — строкой; принимаем оба вида.
  // Раньше строка молча ничего не удаляла: запись размонтированного параграфа
  // оставалась в widgets, число виджетов переставало сходиться (widgetsUpdatedTime
  // === null) и пересчёт размера карточки выключался до перезагрузки страницы —
  // отсюда пустая полоса на месте удалённого параграфа.
  const unregisterHandleResize = useCallback((widget) => {
    const widgetId = typeof widget === 'string' ? widget : widget?.id;
    if (!widgetId) return;
    if (widgetId in timelineHeights.current) trackTimeline(widgetId, 0);
    setWidgets((widgets) =>
      widgets.filter((widgetToReturn) => widgetToReturn.id !== widgetId)
    );
  }, []);

  const fitSize = useCallback(
    (width, height) => {
      const spacersCount = pictureOnly
        ? 0
        : widgets.length + (!dontShowHeader ? 0 : 1);
      const { minHeight, maxHeight, minWidth, maxWidth } = getTurnMinMaxHeight(
        widgets,
        width,
        spacersCount * widgetSpacer
      );
      return {
        width: Math.round(Math.min(Math.max(width, minWidth), maxWidth)),
        height: Math.round(
          Math.min(Math.max(height, minHeight), maxHeight)
          // + widgetSpacer * (widgets.length + (!dontShowHeader ? 0 : 1)), // @todo: для компрессора проверить
        ),
      };
    },
    [widgets, dontShowHeader, pictureOnly]
  );

  // force — размер ставится в стиль и без зажатия: рост от ленты цитат, а в стиле могла остаться
  // высота прежнего зажатия, которая перекрывает height: 100%.
  const recalculateSize = useCallback(
    (width, passedHeight, force = false) => {
      const height = passedHeight || 200;
      const { width: newWidth, height: newHeight } = fitSize(width, height);

      turnGeometryQueue.add(() => {
        dispatch(
          updateGeometry({
            _id,
            size: {
              width: newWidth,
              height: newHeight,
            },
          })
        );
      });

      if (typeof $ !== 'undefined') {
        if (force || newHeight !== height || newWidth !== width) {
          $(wrapper.current).css({
            height: `${newHeight}px`,
            width: `${newWidth}px`,
          });
        }
      }
    },
    [id, fitSize]
  );

  // RESIZABLE
  useEffect(() => {
    if (resizeDisabled || restricted) return;
    if (typeof $ === 'undefined') return;

    // The start comes from the element: under zoom ui.originalSize is off.
    let origin = null;
    let travel = null;
    // jQuery UI lays ui.size over the size recalculateSize has set: clamp it the same way.
    const follow = (event, ui) => {
      if (!travel) return;
      const { x, y } = travel(event);
      const size = fitSize(
        Math.min(
          TURN_SIZE_MAX_WIDTH,
          Math.max(
            TURN_SIZE_MIN_WIDTH,
            snapRound(origin.width + x, GRID_CELL_X),
          ),
        ),
        snapRound(origin.height + y, GRID_CELL_Y),
      );
      ui.size.width = size.width;
      ui.size.height = size.height;
    };
    $(wrapper.current).resizable({
      grid: [GRID_CELL_X, GRID_CELL_Y],
      minWidth: TURN_SIZE_MIN_WIDTH,
      maxWidth: TURN_SIZE_MAX_WIDTH,
      start: (event) => {
        const el = wrapper.current;
        origin = { width: el.clientWidth, height: el.clientHeight };
        travel = mouseTravel(store.getState().game.zoom, event);
      },
      resize: (event, ui) => {
        follow(event, ui);
        recalculateSize(
          snapRound(ui.size.width, GRID_CELL_X),
          snapRound(ui.size.height, GRID_CELL_Y)
        );
      },
      stop: (event, ui) => {
        follow(event, ui);
        turnGeometryQueue.clear();
        recalculateSize(
          snapRound(ui.size.width, GRID_CELL_X),
          snapRound(ui.size.height, GRID_CELL_Y)
        );
        dispatch(recalcAreaRect());
      },
    });
    return () => {
      $(wrapper.current).resizable('destroy');
    };
  }, [resizeDisabled, widgets, restricted]);

  useEffect(() => {
    if (!wrapper.current) return;
    if (!widgetsUpdatedTime) return;
    const growth = timelineGrowth.current;
    timelineGrowth.current = 0;
    sized.current = true;
    recalculateSize(
      snapRound(wrapper.current.clientWidth, GRID_CELL_X),
      snapRound(wrapper.current.clientHeight + growth, GRID_CELL_Y),
      growth !== 0
    );
  }, [widgetsUpdatedTime, updatedAt]);

  return (
    <MediaPlaybackProvider turnId={_id}>
      <div ref={wrapper} className={wrapperClasses} style={wrapperStyles}>
        {!dontShowHeader ? (
          <Header
            widgetId={'h_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            _id={_id}
          />
        ) : (
          <div style={{ height: '0px' }} />
        )}
        {!!videoUrl && (
          <Video
            widgetId={'v_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            turnId={_id}
          />
        )}
        {hasVideoQuotes && (
          <TimelineQuotes
            kind="video"
            widgetId={'vq_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            widgetsUpdatedTime={widgetsUpdatedTime}
            turnId={_id}
          />
        )}
        {!!audioUrl && (
          <Audio
          widgetId={'a_1'}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          turnId={_id}
          />
        )}
        {hasAudioQuotes && (
          <TimelineQuotes
            kind="audio"
            widgetId={'aq_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            widgetsUpdatedTime={widgetsUpdatedTime}
            turnId={_id}
          />
        )}
        {!!imageUrl && (
          <Picture
            widgetId={'i_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            turnId={_id}
            pictureOnly={pictureOnly}
          />
        )}
        {!!pdfUrl && (
          <Pdf
            widgetId={'pdf_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            turnId={_id}
          />
        )}
        {!!splitPair && !restricted && (
          <HorizontalSplit
            move={onSplitMove}
            setIsDragging={onSplitDragging}
            extraClasses="turn-split not-draggable"
            testId={TID.turnSplit}
          />
        )}
        {doesParagraphExist && (
          <Paragraph
            widgetsUpdatedTime={widgetsUpdatedTime}
            turnId={_id}
            widgetId={'p_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            // widget={widgetD['p_1']}
          />
        )}
      </div>
      <ButtonsMenu _id={_id} />
      {sourceShow && (
        <div className="stb-react-turn__bottom-subtitle">
          <DateAndSourceUrl widgetId="s_1" date={date} url={sourceUrl} />
        </div>
      )}
    </MediaPlaybackProvider>
  );
});

export default memo(TurnAdapter);

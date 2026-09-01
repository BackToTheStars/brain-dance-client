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
  markTurnAsChanged,
  recalcAreaRect,
  updateGeometry,
} from '../redux/actions';
import turnSettings from '../settings';
import { getQueue } from './helpers/queueHelper';
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
import VideoQuotes from './widgets/video/VideoQuotes';
import AudioQuotes from './widgets/audio/AudioQuotes';
import { MediaPlaybackProvider } from './widgets/media/PlaybackContext';
import { TID } from '@/config/testIds';

// Очереди — на карточку, а не на модуль. Общая очередь отменяла отложенный вызов
// предыдущей карточки (`getQueue.add` делает clearTimeout), поэтому при первом рендере
// обновления геометрии почти всех ходов терялись: DOM внутренней карточки уже был
// пересчитан по контенту, а в сторе (и во внешнем контейнере, к которому привязан блок
// источника) оставалась высота с бэкенда.
const TurnAdapter = ({ id }) => {
  const turnPositionQueue = useRef(getQueue(TURNS_POSITION_TIMEOUT_DELAY)).current;
  const gamePosition = useSelector((state) => state.game.position);
  const dispatch = useDispatch();
  const wrapper = useRef(null);
  const position = useSelector((state) => state.turns.g[id].position);
  const width = useSelector((state) => state.turns.g[id].size?.width);
  const height = useSelector((state) => state.turns.g[id].size?.height);
  const contentType = useSelector((state) => state.turns.g[id].contentType);
  const { wrapperClasses, wrapperStyles } = useMemo(() => {
    const wrapperStyles = {
      left: `${position.x - (gamePosition.x || 0)}px`,
      top: `${position.y - (gamePosition.y || 0)}px`,
      width: `${width}px`,
      height: `${height}px`,
    };

    const wrapperClasses = ['stb-react-turn', `turn_${id}`, contentType].join(
      ' '
    );
    return {
      wrapperClasses,
      wrapperStyles,
    };
  }, [gamePosition, position, width, height]);

  // DRAGGABLE
  useEffect(() => {
    if (typeof $ === 'undefined') return;
    $(wrapper.current).draggable({
      // grid: [GRID_CELL_X, GRID_CELL_X],
      start: (event, ui) => {
        $('#game-box')
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
              wasChanged: true,
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
        dispatch(markTurnAsChanged({ _id: id }));
      },
      cancel: ".not-draggable",
    });

    return () => $(wrapper.current).draggable('destroy');
  }, [gamePosition]);

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
  const turnGeometryQueue = useRef(getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY)).current;

  const [widgets, setWidgets] = useState([]);
  const wrapper = useRef(null);

  const {
    _id,
    colors: { background },
    contentType,
    updatedAt,
    dWidgets: {
      p_1: { inserts: paragraph },
      i_1: { url: imageUrl },
      v_1: { url: videoUrl },
      vq_1: { duration: videoQuotesDuration },
      aq_1: { duration: audioQuotesDuration },
      a_1: { url: audioUrl },
      // pdf_1 — защитный дефолт на случай отсутствия в dWidgets
      pdf_1: { url: pdfUrl } = {},
      h_1: { show: headerShow },
      s_1: { url: sourceUrl, date, show: sourceShow },
    },
    pictureOnly,
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

  const widgetsCount = useMemo(() => {
    return (
      !dontShowHeader + // header
      !!imageUrl + // Picture
      !!videoUrl + // Video
      !!videoQuotesDuration + // Video quotes
      !!audioQuotesDuration + // Audio quotes
      !!audioUrl + // Audio
      !!pdfUrl + // Pdf
      doesParagraphExist
    ); // Paragraph
  }, [
    dontShowHeader,
    imageUrl,
    videoUrl,
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

  const wrapperStyles = useMemo(() => {
    const wrapperStyles = {};

    if (!!background && contentType === turnSettings.TEMPLATE_COMMENT) {
      wrapperStyles.backgroundColor = background;
    }
    return wrapperStyles;
  }, [background, contentType]);

  const wrapperClasses = useMemo(() => {
    const wrapperClasses = ['stb-react-turn__inner'];

    if (pictureOnly) {
      wrapperClasses.push('picture-only');
    }

    return wrapperClasses.join(' ');
  }, [pictureOnly]);

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

  // Виджеты зовут с объектом (`{ id }`), параграфные — строкой; принимаем оба вида.
  // Раньше строка молча ничего не удаляла: запись размонтированного параграфа
  // оставалась в widgets, число виджетов переставало сходиться (widgetsUpdatedTime
  // === null) и пересчёт размера карточки выключался до перезагрузки страницы —
  // отсюда пустая полоса на месте удалённого параграфа.
  const unregisterHandleResize = useCallback((widget) => {
    const widgetId = typeof widget === 'string' ? widget : widget?.id;
    if (!widgetId) return;
    setWidgets((widgets) =>
      widgets.filter((widgetToReturn) => widgetToReturn.id !== widgetId)
    );
  }, []);

  const recalculateSize = useCallback(
    (width, passedHeight) => {
      const height = passedHeight || 200;
      const spacersCount = pictureOnly
        ? 0
        : widgets.length + (!dontShowHeader ? 0 : 1);
      const { minHeight, maxHeight, minWidth, maxWidth } = getTurnMinMaxHeight(
        widgets,
        width,
        spacersCount * widgetSpacer
      );
      const newHeight = Math.round(
        Math.min(Math.max(height, minHeight), maxHeight)
        // + widgetSpacer * (widgets.length + (!dontShowHeader ? 0 : 1)), // @todo: для компрессора проверить
      );

      const newWidth = Math.round(
        Math.min(Math.max(width, minWidth), maxWidth)
      ); //+ widgetSpacer;

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
        if (newHeight !== height || newWidth !== width) {
          $(wrapper.current).css({
            height: `${newHeight}px`,
            width: `${newWidth}px`,
          });
        }
      }
    },
    [id, widgets, dontShowHeader, pictureOnly]
  );

  // RESIZABLE
  useEffect(() => {
    if (resizeDisabled) return;
    if (typeof $ === 'undefined') return;

    $(wrapper.current).resizable({
      grid: [GRID_CELL_X, GRID_CELL_Y],
      minWidth: TURN_SIZE_MIN_WIDTH,
      maxWidth: TURN_SIZE_MAX_WIDTH,
      resize: (event, ui) => {
        recalculateSize(
          snapRound(ui.size.width, GRID_CELL_X),
          snapRound(ui.size.height, GRID_CELL_Y)
        );
        dispatch(markTurnAsChanged({ _id }));
      },
      stop: (event, ui) => {
        turnGeometryQueue.clear();
        recalculateSize(
          snapRound(ui.size.width, GRID_CELL_X),
          snapRound(ui.size.height, GRID_CELL_Y)
        );
        dispatch(markTurnAsChanged({ _id }));
        dispatch(recalcAreaRect());
      },
    });
    return () => {
      $(wrapper.current).resizable('destroy');
    };
  }, [resizeDisabled, widgets]);

  useEffect(() => {
    if (!wrapper.current) return;
    if (!widgetsUpdatedTime) return;
    recalculateSize(
      snapRound(wrapper.current.clientWidth, GRID_CELL_X),
      snapRound(wrapper.current.clientHeight, GRID_CELL_Y)
    );
  }, [widgetsUpdatedTime, updatedAt]);

  return (
    <MediaPlaybackProvider>
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
        {!!videoQuotesDuration && (
          <VideoQuotes
            widgetId={'vq_1'}
            mediaWidgetId={'v_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
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
        {!!audioQuotesDuration && (
          <AudioQuotes
            widgetId={'aq_1'}
            mediaWidgetId={'a_1'}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
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

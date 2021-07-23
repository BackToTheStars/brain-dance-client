import { ParagraphTextWrapper } from './functions';
import { RULE_TURNS_CRUD } from '../config';
import { dateFormatter } from '../helpers/formatters/dateFormatter';
import { getShortLink } from '../helpers/formatters/urlFormatter';
import { youtubeFormatter } from '../helpers/formatters/youtubeFormatter';
import { useRef, useEffect, useState } from 'react';
import {
  ACTION_DELETE_TURN,
  ACTION_TURN_WAS_CHANGED,
  ACTION_SET_TURN_TO_EDIT_MODE,
  ACTION_QUOTE_CLICKED,
  ACTION_QUOTE_COORDS_UPDATED,
} from '../contexts/TurnContext';
import YouTube from 'react-youtube';

let timerId = null;
let timerScroll = null;

const Turn = ({
  turn,
  can,
  dispatch,
  left,
  top,
  deleteTurn,
  setCreateEditTurnPopupIsHidden,
  tempMiddlewareFn,
  lineEnds,
  activeQuote,
  windowSize,
}) => {
  const {
    _id,
    x,
    y,
    width,
    height,
    header,
    sourceUrl,
    date,
    imageUrl,
    paragraph,
    wasChanged = false,
    scrollPosition,
    quotes,
    contentType,
    backgroundColor,
    fontColor,
    dontShowHeader,
  } = turn;
  const wrapper = useRef(null);
  const paragraphEl = useRef(null);
  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);
  const mediaWrapperEl = useRef(null);
  const videoEl = useRef(null);
  const headerEl = useRef(null);

  const [quotesWithCoords, setQuotesWithCoords] = useState([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [updateSizeTime, setUpdateSizeTime] = useState(new Date().getTime());
  const [imageLoaded, setImageLoaded] = useState(false);

  const isParagraphExist = !!paragraph
    .map((item) => item.insert)
    .join('')
    .trim(); // @todo: remove after quill fix

  let { videoUrl } = turn;
  if (videoUrl) {
    if (videoUrl.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
      // @todo videoFormatter()
      videoUrl = youtubeFormatter(videoUrl);
    } else {
      console.log(`Unknown video source: "${videoUrl}"`);
    }
  }

  const onQuoteClick = (quoteId) => {
    dispatch({ type: ACTION_QUOTE_CLICKED, payload: { turnId: _id, quoteId } });
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

  const handleResize = () => {
    // this.wasChanged = true;
    let minMediaHeight = 15; // @todo

    const headerHeight = dontShowHeader ? 0 : $(headerEl.current).height();

    // let maxMediaHeight = isParagraphExist
    //   ? paragraphEl.current.scrollHeight + 15
    //   : 15; // 15 это снизу появляется нестыковка
    let maxMediaHeight =
      isParagraphExist && paragraphEl.current
        ? paragraphEl.current.scrollHeight
        : minMediaHeight;
    if (imgEl && imgEl.current) {
      const newImgHeight = Math.floor(
        (imgEl.current.naturalHeight * $(wrapper.current).width()) /
          imgEl.current.naturalWidth
      );
      $(imgWrapperEl.current).width($(wrapper.current).width());
      $(imgWrapperEl.current).height(newImgHeight);
      minMediaHeight += newImgHeight;
      maxMediaHeight += newImgHeight;
      $(mediaWrapperEl.current).css('min-height', `${minMediaHeight}px`);
    } else if (videoEl && videoEl.current) {
      // $(videoEl.current).width($(wrapper.current).width() - 3); // можно использовать в дизайне
      $(videoEl.current).width($(wrapper.current).width());
      $(videoEl.current).height(
        Math.floor((9 * $(wrapper.current).width()) / 16)
      );
      // @tmp start
      // $(videoEl.current)
      //   .find('iframe')
      //   .width($(wrapper.current).width() - 3);
      $(videoEl.current).find('iframe').width($(wrapper.current).width());
      $(videoEl.current)
        .find('iframe')
        .height(Math.floor((9 * $(wrapper.current).width()) / 16));
      // @tmp end
      minMediaHeight += $(videoEl.current).height();
      maxMediaHeight += $(videoEl.current).height();
      $(mediaWrapperEl.current).css('min-height', `${minMediaHeight}px`);
    }
    // const paragraphExtraPx = isParagraphExist ? 50 : 0;

    // $(wrapper.current).css(
    //   'min-height',
    //   `${minMediaHeight + headerHeight + paragraphExtraPx}px`
    // );

    $(wrapper.current).css('min-height', `${minMediaHeight + headerHeight}px`);
    // $(wrapper.current).css(
    //   'max-height',
    //   `${maxMediaHeight + headerHeight - 2}px`
    // );
    $(wrapper.current).css('max-height', `${maxMediaHeight + headerHeight}px`);
    // получить высоту el, вычесть высоту header, сохранить в media wrapper

    // $(mediaWrapperEl.current).height(
    //   // @fixme: 1px
    //   $(wrapper.current).height() + 1 - headerHeight
    // );
    $(mediaWrapperEl.current).height(
      $(wrapper.current).height() - headerHeight
    );

    // if (!(minMediaHeight + headerHeight + paragraphExtraPx)) {
    //   console.log('Необходимо выполнить проверку минимальной высоты шага');
    // }
    // if (!(maxMediaHeight + headerHeight - 2)) {
    //   console.log('Необходимо выполнить проверку максимальной высоты шага');
    // }

    if (timerId) {
      // замедляем на 200мс update линий между цитатами
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      setQuotesLoaded(false);
      setQuotesWithCoords([]);
      setUpdateSizeTime(new Date().getTime());
    }, 200);
  };

  useEffect(() => {
    handleResize();
  }, [windowSize]);

  useEffect(() => {
    if (quotesLoaded) return;
    if (quotesWithCoords.length === quotes.length) {
      setQuotesLoaded(true);
    }
    if (quotesWithCoords.length === quotes.length) {
      dispatch({
        type: ACTION_QUOTE_COORDS_UPDATED,
        payload: { turnId: _id, quotesInfo: quotesWithCoords },
      });
    }
  }, [quotesWithCoords]);

  // useEffect(() => {
  //   if (!paragraphEl) return;
  //   if (!paragraphEl.current) return;
  //   const spans = [];
  //   paragraphEl.current.querySelectorAll('span').forEach((span) => {
  //     spans.push(span);
  //   });
  //   // console.log({ spans });
  //   const quotes = spans.filter((span) => !!span.style.backgroundColor);
  //   // console.log({ quotes });
  // }, [paragraphEl]);

  useEffect(() => {
    $(wrapper.current).draggable({
      start: (event, ui) => {
        // triggers.dispatch('MAKE_FIELD_TRANSLUCENT', true)
      },
      stop: (event, ui) => {
        // this.wasChanged = true;
        // triggers.dispatch('DRAW_LINES');
        // triggers.dispatch('MAKE_FIELD_TRANSLUCENT', false);
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
      drag: (event, ui) => {
        // triggers.dispatch('DRAW_LINES')
      },
    });
    $(wrapper.current).resizable({
      stop: (event, ui) => {
        // triggers.dispatch('DRAW_LINES')
        dispatch({
          type: ACTION_TURN_WAS_CHANGED,
          payload: {
            _id: _id,
            wasChanged: true,
            width: ui.size.width,
            height: ui.size.height,
          },
        });
      },
    });
    if (!!paragraphEl.current) {
      paragraphEl.current.addEventListener('scroll', () => {
        // setQuotesLoaded(false);
        // setQuotesWithCoords([]);
        // setUpdateSizeTime(new Date().getTime());
        handleResize();
        if (timerScroll) {
          clearTimeout(timerScroll);
        }
        timerScroll = setTimeout(() => {
          // console.log(Math.floor(paragraphEl.current.scrollTop));
          dispatch({
            type: ACTION_TURN_WAS_CHANGED,
            payload: {
              _id: _id,
              wasChanged: true,
              scrollPosition: paragraphEl.current.scrollTop,
            },
          });
        }, 150);
      });
    }
  }, []);

  useEffect(handleResize, [turn, imageLoaded]);

  useEffect(() => {
    if (!wrapper) return;
    wrapper.current.onresize = handleResize;
    handleResize();
    // wrapper.current.addEventListener('resize', handleResize);
    // return () => {
    //   wrapper.current.removeEventListener('resize', handleResize);
    // };
  }, [wrapper]);

  useEffect(() => {
    if (!paragraph || !paragraphEl.current || !scrollPosition) return;
    if (!!imgEl && !!imgEl.current && !imageLoaded) return;

    paragraphEl.current.scrollTop = scrollPosition;
  }, [
    paragraphEl,
    scrollPosition,
    imageLoaded,
    // , imgEl
  ]);

  useEffect(() => {
    if (!imgEl || !imgEl.current) return;
    imgEl.current.onload = () => {
      handleResize();
      setImageLoaded(true);
      // setTimeout(() => {
      //   dispatch({
      //     type: ACTION_TURN_WAS_CHANGED,
      //     payload: {
      //       _id: _id,
      //     },
      //   });
      // }, 500);
    };
    return () => {
      // @todo: remove event handler
    };
  }, [imgEl]);

  const styles = {
    wrapper: {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    },
  };

  return (
    <div
      ref={wrapper}
      className={`${contentType} react-turn ${
        dontShowHeader ? 'dont-show-header' : ''
      }`}
      style={styles.wrapper}
    >
      <h5
        className="headerText"
        ref={headerEl}
        style={
          contentType === 'comment' && !dontShowHeader
            ? { backgroundColor, color: fontColor || 'black' }
            : {}
        }
      >
        <div className="headerTextTitle">{header}</div>
        <div className="headerTextActions">
          {can(RULE_TURNS_CRUD) && (
            <>
              <a key="edit" className="edit-btn" onClick={handleEdit}>
                <i className="fas fa-pen-square"></i>
              </a>

              <a key="delete" className="delete-btn" onClick={handleDelete}>
                <i className="fas fa-trash-alt"></i>
              </a>
            </>
          )}
        </div>
      </h5>

      {!!sourceUrl && (
        <div className="left-bottom-label">
          <a target="_blank" href={sourceUrl}>
            {getShortLink(sourceUrl)}
          </a>
        </div>
      )}
      {!!date && (
        <div className="right-bottom-label">{dateFormatter(date)}</div>
      )}

      <div className="media-wrapper" ref={mediaWrapperEl}>
        {!!(videoUrl && videoUrl.trim()) && (
          <div className="video" ref={videoEl}>
            <div className="iframe-overlay" />
            <YouTube
              videoId={videoUrl}
              onReady={() =>
                setTimeout(() => {
                  // @todo: убедиться, что iframe не только "готов", но и отрисован
                  handleResize();
                }, 1000)
              }
              width="100%"
              height="100%"
            ></YouTube>

            {/* <iframe
              src={`https://www.youtube.com/embed/${videoUrl}`}
              allow="accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen="allowFullScreen"
              frameBorder="0"
              ref={iframeEl}
            ></iframe> */}
          </div>
        )}
        {!!(imageUrl && imageUrl.trim()) && ( // карусель в будущем
          <div className="picture-content" ref={imgWrapperEl}>
            <img src={imageUrl} ref={imgEl} />
          </div>
        )}
        {isParagraphExist && (
          <p
            className="paragraphText"
            ref={paragraphEl}
            style={
              contentType === 'comment'
                ? { backgroundColor, color: fontColor || 'black' }
                : {}
            }
          >
            <ParagraphTextWrapper
              arrText={paragraph || []}
              updateSizeTime={updateSizeTime}
              setQuotes={setQuotesWithCoords}
              onQuoteClick={onQuoteClick}
            />
            {/* {getParagraphText(
              paragraph || [],
              setQuotesWithCoords,
              onQuoteClick
            )} */}
          </p>
        )}
      </div>

      <>
        {quotesWithCoords.map((quote, i) => {
          let bordered = !!lineEnds[quote.id]; // проверка нужно показывать рамку или нет
          if (
            activeQuote &&
            activeQuote.turnId === _id &&
            activeQuote.quoteId === quote.id
          ) {
            bordered = true;
          }
          return (
            <div
              key={i}
              style={{
                ...quote,
                position: 'absolute',
                outline: bordered ? '2px solid red' : '0px solid transparent',
                cursor: 'pointer',
              }}
              onClick={() => onQuoteClick(quote.id)}
            ></div>
          );
        })}
      </>
    </div>
  );
};

export default Turn;

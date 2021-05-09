import { getParagraphText } from './functions';
import { RULE_TURNS_CRUD } from '../config';
import { dateFormatter } from '../../src/formatters/dateFormatter';
import { getShortLink } from '../../src/formatters/urlFormatter';
import { youtubeFormatter } from '../../src/formatters/youtubeFormatter';
import { useRef, useEffect } from 'react';
import { ACTION_DELETE_TURN } from '../contexts/TurnContext';

const Turn = ({ turn, can, dispatch }) => {
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
  } = turn;
  const wrapper = useRef(null);
  const paragraphEl = useRef(null);
  const imgEl = useRef(null);
  const imgWrapperEl = useRef(null);
  const mediaWrapperEl = useRef(null);
  const videoEl = useRef(null);
  const headerEl = useRef(null);

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

  const handleEdit = (e) => {
    e.preventDefault();
    alert('button_edit_clicked');
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (confirm('Точно удалить?')) {
      // confirm - глобальная функция браузера
      dispatch({ type: ACTION_DELETE_TURN, payload: { _id } });
      //alert('button_delete_clicked');
    }
  };

  const handleResize = () => {
    // this.wasChanged = true;
    let minMediaHeight = 15; // @todo

    let maxMediaHeight = isParagraphExist
      ? paragraphEl.current.scrollHeight + 15
      : 15; // 15 это снизу появляется нестыковка
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
    } else if (videoEl) {
      $(videoEl.current).width($(wrapper.current).width() - 3); // можно использовать в дизайне
      $(videoEl.current).height(
        Math.floor((9 * $(wrapper.current).width()) / 16)
      );
      minMediaHeight += $(videoEl.current).height();
      maxMediaHeight += $(videoEl.current).height();
      $(mediaWrapperEl.curren).css('min-height', `${minMediaHeight}px`);
    }
    // получить высоту el, вычесть высоту header, сохранить в media wrapper
    $(mediaWrapperEl.current).height(
      // @fixme: 1px
      $(wrapper.current).height() + 1 - $(headerEl.current).height()
    );
    const paragraphExtraPx = isParagraphExist ? 50 : 0;

    $(wrapper.current).css(
      'min-height',
      `${minMediaHeight + $(headerEl.current).height() + paragraphExtraPx}px`
    );
    $(wrapper.current).css(
      'max-height',
      `${maxMediaHeight + $(headerEl.current).height() - 2}px`
    );
  };

  useEffect(() => {
    $(wrapper.current).draggable({
      start: (event, ui) => {
        // triggers.dispatch('MAKE_FIELD_TRANSLUCENT', true)
      },
      stop: (event, ui) => {
        // this.wasChanged = true;
        // triggers.dispatch('DRAW_LINES');
        // triggers.dispatch('MAKE_FIELD_TRANSLUCENT', false);
      },
      drag: (event, ui) => {
        // triggers.dispatch('DRAW_LINES')
      },
    });
    $(wrapper.current).resizable({
      stop: (event, ui) => {
        // triggers.dispatch('DRAW_LINES')
      },
    });
  }, []);

  useEffect(() => {
    if (!wrapper) return;
    wrapper.current.onresize = handleResize;
    handleResize();
    // wrapper.current.addEventListener('resize', handleResize);
    // return () => {
    //   wrapper.current.removeEventListener('resize', handleResize);
    // };
  }, [wrapper]);

  const styles = {
    wrapper: {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    },
  };

  return (
    <div ref={wrapper} className="react-turn" style={styles.wrapper}>
      <h5 className="headerText" ref={headerEl}>
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
            <iframe
              src={`https://www.youtube.com/embed/${videoUrl}`}
              allow="accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen="allowFullScreen"
              frameBorder="0"
            ></iframe>
          </div>
        )}
        {!!(imageUrl && imageUrl.trim()) && ( // карусель в будущем
          <div className="picture-content" ref={imgWrapperEl}>
            <img src={imageUrl} ref={imgEl} />
          </div>
        )}
        {isParagraphExist && (
          <p className="paragraphText" ref={paragraphEl}>
            {getParagraphText(paragraph || [])}
          </p>
        )}
      </div>
    </div>
  );
};

export default Turn;

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
      <h5 className="headerText">
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

      <div className="media-wrapper">
        {!!(videoUrl && videoUrl.trim()) && (
          <div className="video">
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
          <div className="picture-content">
            <img src={imageUrl} />
          </div>
        )}
        {getParagraphText(paragraph || [])}
      </div>
    </div>
  );
};

export default Turn;

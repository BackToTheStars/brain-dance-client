import { useTurnContext, ACTION_DELETE_TURN } from './contexts/TurnContext';
import { useUserContext } from './contexts/UserContext';
import { RULE_TURNS_CRUD } from './config';
import { dateFormatter } from '../src/formatters/dateFormatter';
import { getShortLink } from '../src/formatters/urlFormatter';
import { youtubeFormatter } from '../src/formatters/youtubeFormatter';
import { Fragment } from 'react';

const getParagraphText = (arrText) => {
  return (
    <p className="paragraphText">
      {arrText.map((textItem, i) => {
        // @todo: refactoring
        const arrInserts = textItem.insert ? textItem.insert.split('\n') : [];
        const newInserts = [];
        for (let arrInsert of arrInserts) {
          newInserts.push(arrInsert);
          newInserts.push(<br />);
        }
        newInserts.pop();
        return (
          <span key={i} style={textItem.attributes}>
            {newInserts}
          </span>
        );
      })}
    </p>
  );

  // const el = document.createElement('p');
  // for (let textItem of arrText) {
  //   const spanEl = document.createElement('span');
  //   if (textItem.attributes) {
  //     for (let property of Object.keys(textItem.attributes)) {
  //       spanEl.style[property] = textItem.attributes[property];
  //     }
  //   }
  //   spanEl.innerText = textItem.insert;
  //   el.appendChild(spanEl);
  // }
  // return el.innerHTML;
};

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

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: `2px solid blue`,
        zIndex: 2,
      }}
    >
      <h5 className="headerText">
        <div className="headerTextTitle">{header}</div>
        <div className="headerTextActions">
          {can(RULE_TURNS_CRUD) && (
            <>
              <a className="edit-btn" onClick={handleEdit}>
                <i className="fas fa-pen-square"></i>
              </a>
              <a className="delete-btn" onClick={handleDelete}>
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

      <div
        className="media-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {!!(videoUrl && videoUrl.trim()) && (
          <div className="video">
            <div className="iframe-overlay" />
            <iframe
              src={`https://www.youtube.com/embed/${videoUrl}`}
              allow="accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen="allowFullScreen"
              frameBorder="0"
              style={{ width: '100%', height: '100%' }}
            ></iframe>
          </div>
        )}
        {!!(imageUrl && imageUrl.trim()) && ( // карусель в будущем
          <div className="picture-content">
            <img
              src={imageUrl}
              style={{
                background: 'rgb(0, 0, 0)',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        )}
        {getParagraphText(paragraph || [])}
      </div>
    </div>
  );
};

const TurnsComponent = () => {
  const { turns, dispatch } = useTurnContext();
  const { can } = useUserContext();

  console.log('turns component', { turns });
  return (
    <>
      {turns.map((turn) => {
        return (
          <Turn turn={turn} key={turn._id} can={can} dispatch={dispatch} />
        );
      })}
    </>
  );
};

export default TurnsComponent;

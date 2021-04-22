import { useTurnContext } from './contexts/TurnContext';
import { useUserContext } from './contexts/UserContext';
import { RULE_TURNS_CRUD } from './config';
import { dateFormatter } from '../src/formatters/dateFormatter';
import { getShortLink } from '../src/formatters/urlFormatter';
import { youtubeFormatter } from '../src/formatters/youtubeFormatter';

const Turn = ({ turn, can }) => {
  const { x, y, width, height, header, sourceUrl, date } = turn;
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
    alert('button_delete_clicked');
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

        {/*`

            ${
              imageUrl && imageUrl.trim()
                ? `<div class="picture-content">
                    <img src="${imageUrl}"
                        style="background: rgb(0, 0, 0); width: 100%; height: 100%;">
                </div>`
                : ''
            }
            <p class="paragraphText">
                ${getParagraphText(paragraph || [])}
            </p>
                  `*/}
      </div>
    </div>
  );
};

const TurnsComponent = () => {
  const { turns } = useTurnContext();
  const { can } = useUserContext();

  console.log('turns component', { turns });
  return (
    <>
      {turns.map((turn) => {
        return <Turn turn={turn} key={turn._id} can={can} />;
      })}
    </>
  );
};

export default TurnsComponent;

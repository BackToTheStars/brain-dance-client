import { useSelector } from 'react-redux';
import { useMainLayoutContext } from '../layout/MainLayoutContext';

const getVideoImg = (url) => {
  if (url.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    const newVideoUrl = url.split('=')[1];
    return `https://img.youtube.com/vi/${newVideoUrl}/0.jpg`;
  } else {
    return '';
  }
};

const limitLine = (line) => {
  return {
    WebkitLineClamp: `${line}`,
    WebkitBoxOrient: 'vertical',
    display: 'inline-block',
    display: '-webkit-box',
    maxHeight: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
};

const TurnModal = ({ params }) => {
  const { sliderWidth } = useMainLayoutContext();
  const { id } = params;
  const turn = useSelector((s) => s.lobby.dTurns[id]);
  const { header, imageUrl, videoUrl, paragraph, date, contentType, width } =
    turn || {};
  const newDate = new Date(date);
  const text = (paragraph && paragraph[0]?.insert) || null;
  const videoImg = getVideoImg(videoUrl || '');
  return (
    <div
      style={{ width: `${sliderWidth}px` }}
      className="dark:bg-dark-light bg-light h-full flex flex-col rounded"
    >
      <div className="bg-main-dark rounded-t p-4">
        {!!header && <h2 style={limitLine(2)}>{header}</h2>}
        {!!date && (
          <time className="block mt-1">{newDate.toLocaleDateString()}</time>
        )}
      </div>
      <div className="w-full h-auto">
        {!!imageUrl && (
          <img
            src={imageUrl}
            className="w-full h-auto object-contain object-center"
            alt={`${header}`}
          />
        )}
        {!!videoImg && (
          <img
            src={videoImg}
            className="w-full h-auto object-contain object-center"
            alt={`${header}`}
          />
        )}
      </div>
      <div className="h-full overflow-auto p-4 dark:text-main-text text-dark-light">
        {!!text && <p>{text}</p>}
      </div>
      {/* {!!contentType && <p>{contentType}</p>} */}
    </div>
  );
};

export default TurnModal;

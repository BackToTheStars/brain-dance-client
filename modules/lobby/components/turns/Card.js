const getVideoImg = (url) => {
  if (url.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    const newVideoUrl = url.split('=')[1];
    return `https://img.youtube.com/vi/${newVideoUrl}/0.jpg`;
  } else {
    return '';
  }
};

const TurnCard = ({ turn }) => {
  const { header, imageUrl, videoUrl, paragraph } = turn;
  const text = (paragraph && paragraph[0]?.insert) || null;
  const videoImg = getVideoImg(videoUrl || '');
  return (
    <div className="border p-2">
      {!!header && <h2 className="bg-blue-800">{header}</h2>}
      {!!imageUrl && <img src={imageUrl} />}
      {!!videoImg && <img src={videoImg} />}
      {!!text && <p className="dark:text-white text-dark">{text}</p>}
      {/* <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxHeight: '700px',
          overflow: 'scroll',
        }}
      >
        {JSON.stringify(turn, null, 2)}
      </pre> */}
    </div>
  );
};

export default TurnCard;

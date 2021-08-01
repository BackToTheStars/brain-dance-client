const TurnNewComponent = ({ turn }) => {
  const { _id, x, y, width, height } = turn;
  const wrapperStyles = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
  return (
    <div className="react-turn-new" style={wrapperStyles}>
      TurnNewComponent
    </div>
  );
};

export default TurnNewComponent;

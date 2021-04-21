import { useTurnContext } from './contexts/TurnContext';

const Turn = ({ turn }) => {
  const { x, y, width, height } = turn;
  // console.log('turn component', { turn });
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
      {turn._id}
    </div>
  );
};

const TurnsComponent = () => {
  const { turns } = useTurnContext();
  console.log('turns component', { turns });
  return (
    <>
      {turns.map((turn) => {
        return <Turn turn={turn} key={turn._id} />;
      })}
    </>
  );
};

export default TurnsComponent;

import { useTurnContext } from './contexts/TurnContext';

const Turn = ({ turn }) => {
  console.log('turn component', { turn });
  return <p>{turn._id}</p>;
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

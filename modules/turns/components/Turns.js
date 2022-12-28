import { useSelector } from 'react-redux';
import Turn from './Turn';

const Turns = () => {
  //  const turns = useSelector(store => store.turns.turns)
  const turns = useSelector((store) => store.turns.turnsToRender);

  return (
    <>
      {/* {turns.map((turn) => (
        <Turn key={turn._id} id={turn._id} />
      ))} */}
      {turns.map((id) => (
        <Turn key={id} id={id} />
      ))}
    </>
  );
};

export default Turns;

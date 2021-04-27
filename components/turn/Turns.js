import { useTurnContext } from '../contexts/TurnContext';
import { useUserContext } from '../contexts/UserContext';
import Turn from './Turn';

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

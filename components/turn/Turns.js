import { useTurnContext } from '../contexts/TurnContext';
import { useUserContext } from '../contexts/UserContext';
import { useUiContext } from '../contexts/UI_Context';
import Turn from './Turn';

const TurnsComponent = () => {
  const { turns, dispatch, left, top, deleteTurn } = useTurnContext();
  const { can } = useUserContext();
  const {
    minimapState: { turnsToRender },
  } = useUiContext();

  // console.log('turns component', { turns }, ' turnsToRender: ', {
  // turnsToRender,
  //   });
  return (
    <>
      {turns
        .filter((turn) => {
          return turnsToRender.includes(turn._id);
        })
        .map((turn) => {
          return (
            <Turn
              key={turn._id}
              {...{ turn, can, dispatch, left, top, deleteTurn }}
            />
          );
        })}
    </>
  );
};

export default TurnsComponent;

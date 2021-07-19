import { useTurnContext } from '../contexts/TurnContext';
import { useUserContext } from '../contexts/UserContext';
import { useUiContext } from '../contexts/UI_Context';
import Turn from './Turn';

const TurnsComponent = () => {
  const {
    turns,
    dispatch,
    left,
    top,
    deleteTurn,
    tempMiddlewareFn,
    lineEnds,
    activeQuote,
  } = useTurnContext();
  const { can } = useUserContext();
  const {
    minimapState: { turnsToRender },
    setCreateEditTurnPopupIsHidden,
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
          const turnLineEnds = {};
          for (let quoteId in lineEnds) {
            const lines = lineEnds[quoteId].lines.filter(
              (line) =>
                (line.sourceTurnId === turn._id &&
                  line.sourceMarker === +quoteId) ||
                (line.targetTurnId === turn._id &&
                  line.targetMarker === +quoteId)
            );
            if (lines.length) {
              turnLineEnds[quoteId] = lines;
            }
          }
          return (
            <Turn
              key={turn._id}
              {...{
                turn,
                can,
                dispatch,
                left,
                top,
                deleteTurn,
                setCreateEditTurnPopupIsHidden,
                tempMiddlewareFn,
                lineEnds: turnLineEnds,
                activeQuote, // активная цитата, на которую кликнули мышкой
              }}
            />
          );
        })}
    </>
  );
};

export default TurnsComponent;

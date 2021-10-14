import { useTurnContext } from '../contexts/TurnContext';
import { useUserContext } from '../contexts/UserContext';
import { useUiContext } from '../contexts/UI_Context';
// import Turn from './Turn';
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
  const { can, saveTurnInBuffer, getTurnFromBufferAndRemove } =
    useUserContext(); // @todo замерять производительность
  const {
    minimapState: { turnsToRender },
    setCreateEditTurnPopupIsHidden,
    windowSize,
    addNotification,
  } = useUiContext();

  // console.log('turns component', { turns }, ' turnsToRender: ', {
  // turnsToRender,
  //   });
  return (
    <>
      {turns
        .filter((turn) => {
          return turnsToRender.includes(turn._id); // оставляем только те, которые рендерятся
        })
        .map((turn) => {
          const turnLineEnds = {};
          for (let quoteKey in lineEnds) {
            const lines = lineEnds[quoteKey].lines.filter(
              (line) =>
                (line.sourceTurnId === turn._id &&
                  line.sourceMarker === +lineEnds[quoteKey].quoteId) ||
                (line.targetTurnId === turn._id &&
                  line.targetMarker === +lineEnds[quoteKey].quoteId)
            );
            if (lines.length) {
              turnLineEnds[quoteKey] = lines;
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
                windowSize,
                saveTurnInBuffer,
                getTurnFromBufferAndRemove,
                addNotification,
              }}
            />
          );
        })}
    </>
  );
};

export default TurnsComponent;

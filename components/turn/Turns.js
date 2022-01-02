import { useTurnsCollectionContext } from '../contexts/TurnsCollectionContext';
import { useUserContext } from '../contexts/UserContext';
import { useUiContext } from '../contexts/UI_Context';
import Turn from './Turn';
import { TurnProvider } from '../contexts/TurnContext';
import NextTurn from './NextTurn';

const TurnsComponent = () => {
  const {
    turns,
    zeroPoint,
    dispatch,
    left,
    top,
    updateTurn,
    deleteTurn,
    tempMiddlewareFn,
    lineEnds,
    activeQuote,
    lines,
  } = useTurnsCollectionContext();
  const { can, saveTurnInBuffer } = useUserContext(); // @todo замерять производительность
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
          // @todo: перенести получение turnLineEnds в TurnsCollectionContext
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
            <TurnProvider
              key={turn._id}
              {...{
                turn,
                zeroPoint,
                can,
                dispatch,
                left,
                top,
                updateTurn,
                deleteTurn,
                setCreateEditTurnPopupIsHidden,
                tempMiddlewareFn,
                lineEnds: turnLineEnds,
                activeQuote, // активная цитата, на которую кликнули мышкой
                windowSize,
                saveTurnInBuffer,
                addNotification,
                lines,
              }}
            >
              <NextTurn />
            </TurnProvider>
          );
        })}
    </>
  );
};

{
  /* <Turn
key={turn._id}
{...{
  turn,
  zeroPoint,
  can,
  dispatch,
  left,
  top,
  updateTurn,
  deleteTurn,
  setCreateEditTurnPopupIsHidden,
  tempMiddlewareFn,
  lineEnds: turnLineEnds,
  activeQuote, // активная цитата, на которую кликнули мышкой
  windowSize,
  saveTurnInBuffer,
  addNotification,
  lines,
}}
/> */
}

export default TurnsComponent;

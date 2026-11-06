import { useDispatch, useSelector } from 'react-redux';
import Turn from './Turn';
import AutoSaveField from './AutoSaveField';
import { useEffect, useMemo } from 'react';
import { loadTurnsData } from '../redux/actions';

const TurnsLoader = () => {
  const dispatch = useDispatch();
  const turnsToRender = useSelector((store) => store.turns.turnsToRender);
  const d = useSelector((store) => store.turns.d);
  useEffect(() => {
    const needToRenderTurns = [];
    for (const id of turnsToRender) {
      if (!d[id]) {
        needToRenderTurns.push(id);
      }
    }
    if (needToRenderTurns.length) {
      dispatch(loadTurnsData(needToRenderTurns));
    }
  }, [turnsToRender, d])
  return null;
}

// turnsToRender идёт по z, а узлы карточек — в постоянном порядке, и наложение задаёт z-index:
// перенос узла в DOM перезагрузил бы iframe плеера и сбросил прокрутку карточки.
const Turns = () => {
  const turns = useSelector((store) => store.turns.turnsToRender);
  const domOrder = useMemo(() => [...turns].sort(), [turns]);
  const layers = useMemo(
    () => new Map(turns.map((id, layer) => [id, layer])),
    [turns],
  );

  return (
    <>
      <div className="turns-layer">
        {domOrder.map((id) => (
          <Turn key={id} id={id} layer={layers.get(id)} />
        ))}
      </div>
      <TurnsLoader />
      <AutoSaveField />
    </>
  );
};

export default Turns;

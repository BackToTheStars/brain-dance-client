import { useDispatch, useSelector } from 'react-redux';
import Turn from './Turn';
import { useEffect } from 'react';
import { loadTurnsData } from '../redux/actions';

const TurnsLoader = () => {
  const dispatch = useDispatch();
  const turnsToRender = useSelector((store) => store.turns.turnsToRender);
  const d = useSelector((store) => store.turns.d);
  useEffect(() => {
    const needToRenderTurns = [];
    for (const id of turnsToRender) {
      if (d[id]?.loadStatus === 'not-loaded' || !d[id]?.loadStatus) {
        needToRenderTurns.push(id);
      }
    }
    if (needToRenderTurns.length) {
      dispatch(loadTurnsData(needToRenderTurns));
    }
  }, [turnsToRender, d])
  return null;
}

const Turns = () => {
  const turns = useSelector((store) => store.turns.turnsToRender);

  return (
    <>
      {turns.map((id) => (
        <Turn key={id} id={id} />
      ))}
      <TurnsLoader />
    </>
  );
};

export default Turns;

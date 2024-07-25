import { Skeleton } from 'antd';
import { Turn } from './Turn';
import { useSelector } from 'react-redux';

const { createContext, useState, useEffect, memo } = require('react');

const TurnStateContext = createContext();

const STAGE_INIT = 'STAGE_INIT';
const STAGE_DATA_LOADED = 'STAGE_DATA_LOADED';

export const TurnStateProvider = memo(({ id }) => {
  const [stage, setStage] = useState(STAGE_INIT);
  const isDataLoaded = useSelector((state) => !!state.turns.d[id]);

  useEffect(() => {
    if (!isDataLoaded) return;
    setStage(STAGE_DATA_LOADED);
  }, [isDataLoaded]);

  if (stage === STAGE_INIT) {
    return <Skeleton active />;
  }

  return (
    <TurnStateContext.Provider value={{ stage, setStage }}>
      <Turn id={id} />
    </TurnStateContext.Provider>
  );
});

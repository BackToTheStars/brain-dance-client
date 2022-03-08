import ClassList from '@/modules/classes/components/ClassList';
import { useSelector } from 'react-redux';
import UIPanel from './UIPanel';

const Panels = () => {
  const hash = useSelector((state) => state.game?.game?.hash);
  if (!hash) return null;
  return (
    <>
      <UIPanel>
        <ClassList hash={hash} />
      </UIPanel>
    </>
  );
};

export default Panels;

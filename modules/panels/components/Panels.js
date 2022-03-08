import ClassList from '@/modules/classes/components/ClassList';
import { useSelector } from 'react-redux';
import UIPanel from './UIPanel';
import { panels } from '../settings';

const Panels = () => {
  const hash = useSelector((state) => state.game?.game?.hash);
  if (!hash) return null;
  return (
    <>
      {panels
        .filter((panel) => panel.isDisplayed)
        .map((panel) => (
          <UIPanel
            key={panel.id}
            position={panel.position}
            height={panel?.height}
            width={panel?.width}
          >
            <panel.component settings={panel} />
          </UIPanel>
        ))}
    </>
  );
};

export default Panels;

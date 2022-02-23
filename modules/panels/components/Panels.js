import ClassList from '@/modules/classes/components/ClassList';
import UIPanel from './UIPanel';

const Panels = ({ hash }) => {
  return (
    <>
      <UIPanel>
        <ClassList hash={hash} />
      </UIPanel>
    </>
  );
};

export default Panels;

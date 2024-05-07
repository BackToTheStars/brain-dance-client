import { SIZE_SM } from '@/config/ui/size';
import { DropdownBlock } from '../ui/DropdownList';
import { contentTypes } from '@/config/lobby/contentType';

const TurnListControls = () => {
  // элементы управления списком ходов (фильтрация, позже - сортировка и поиск)
  return (
    <div className="turn-list-controls">
      <DropdownBlock title="Типы ходов" size={SIZE_SM}>
        <div className="px-1 flex flex-col gap-1">
          {contentTypes.map((type) => (
            <div key={type.value}>{type.label}</div>
          ))}
        </div>
      </DropdownBlock>
    </div>
  );
};

export default TurnListControls;

import { SIZE_SM } from '@/config/ui/size';
import { DropdownBlock } from '../ui/DropdownList';
import { contentTypes } from '@/config/lobby/contentType';
import { switchMode } from '@/modules/lobby/redux/actions';
import {
  ApartmentOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { IntButton as Button } from '@/ui/button';
import { MODAL_ACCESS_GAMES } from '@/config/lobby/modal';
import { openModal } from '@/modules/ui/redux/actions';

const GroupParams = ({ children }) => {
  return <div className="base-group p-2 w-1/2">{children}</div>;
};

const TurnListControls = () => {
  const mode = useSelector((s) => s.lobby.mode);
  const dispatch = useDispatch();
  const btnStyle =
    'w-[30px] h-[30px] border border-main rounded-btn-border leading-[1] flex items-center justify-center select-none';
  // элементы управления списком ходов (фильтрация, позже - сортировка и поиск)
  return (
    <div className="turn-list-controls">
      <div className="flex justify-between items-center mb-3">
        <div className="text-lg font-semibold">Параметры запросов</div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10">
        <div className="flex-1 flex gap-2">
          <GroupParams>
            <Button
              className={mode === 'byGame' ? 'active' : ''}
              size="sm"
              onClick={() => dispatch(switchMode('byGame'))}
            >
              <ApartmentOutlined /> По игре
            </Button>
            <div className="mt-2 cursor-pointer py-2 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center flex-wrap">
              <div className="text-dark w-full">Лимит игр</div>
              <div className="flex gap-x-2 items-center w-[120px]">
                <div className={`${btnStyle}`}>-</div>
                <div className="w-[36px] h-full text-center font-medium">5</div>
                <div className={`${btnStyle}`}>+</div>
              </div>
            </div>
            <div className="cursor-pointer py-2 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center flex-wrap">
              <div className="text-dark w-full">Лимит ходов</div>
              <div className="flex gap-x-2 items-center w-[120px]">
                <div className={`${btnStyle}`}>-</div>
                <div className="w-[36px] h-full text-center font-medium">5</div>
                <div className={`${btnStyle}`}>+</div>
              </div>
            </div>
          </GroupParams>
          <GroupParams>
            <Button
              className={mode === 'chrono' ? 'active' : ''}
              size="sm"
              onClick={() => dispatch(switchMode('chrono'))}
            >
              <ClockCircleOutlined /> Хроно
            </Button>
          </GroupParams>
        </div>
      </div>
      <div className="flex gap-3 py-3">
        <div>
          <Button
            size="sm"
            onClick={() => dispatch(openModal(MODAL_ACCESS_GAMES))}
          >
            <BookOutlined /> Избранные игры
          </Button>
        </div>
        <div className="cursor-pointer">
          <DropdownBlock title="Типы ходов" size={SIZE_SM}>
            <div className="px-1 flex flex-col gap-1">
              {contentTypes.map((type) => (
                <div key={type.value}>{type.label}</div>
              ))}
            </div>
          </DropdownBlock>
        </div>
      </div>
    </div>
  );
};

export default TurnListControls;

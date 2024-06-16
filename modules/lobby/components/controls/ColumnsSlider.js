import { DropdownBlock } from '../ui/DropdownList';
import { Slider } from 'antd';
import { changeTextSettings } from '@/modules/lobby/redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { SIZE_SM } from '@/config/ui/size';
import { useTranslations } from 'next-intl';

const ColumnsSlider = () => {
  const t = useTranslations('Lobby');
  const dispatch = useDispatch();
  const columnCount = useSelector((s) => s.lobby.textSettings.columnCount);
  return (
    <DropdownBlock title={t('Columns')} size={SIZE_SM}>
      <div className="px-1">
        <Slider
          min={2}
          max={7}
          onChange={(value) =>
            dispatch(changeTextSettings('columnCount', value))
          }
          value={columnCount}
        />
      </div>
    </DropdownBlock>
  );
};

export default ColumnsSlider;

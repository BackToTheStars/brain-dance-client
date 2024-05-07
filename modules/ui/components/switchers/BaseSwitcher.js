import { SIZE_SM } from '@/config/ui/size';
import {
  DropdownBlock,
  useDropDown,
} from '@/modules/lobby/components/ui/DropdownList';
import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const BaseSwitcherInner = ({ options, setVal }) => {
  const dispatch = useDispatch();
  const { setShow } = useDropDown();
  return (
    <div className="px-1 flex flex-col gap-1">
      {options.map((option) => (
        <div
          className="cursor-pointer"
          key={option.value}
          onClick={() => {
            dispatch(setVal(option.value));
            setShow(false);
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

const BaseSwitcher = ({
  defaultVal = '',
  selector = () => {},
  size = SIZE_SM,
  options = [],
  setVal = () => {},
}) => {
  const val = useSelector(selector) || defaultVal;
  const optionTitle = useMemo(() => {
    return options.find((m) => m.value === val)?.label || val;
  }, [val]);

  return (
    <DropdownBlock title={optionTitle} size={size}>
      <BaseSwitcherInner options={options} setVal={setVal} />
    </DropdownBlock>
  );
};

export default BaseSwitcher;

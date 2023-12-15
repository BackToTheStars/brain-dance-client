import { CaretDownOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';

const DropdownWrapper = ({ title, children, show, toggleList }) => {
  return (
    <div className="px-1 py-[1px] relative dark:bg-main-dark bg-main border-main-light rounded-btn-border border-2">
      <div
        className="flex items-center cursor-pointer gap-x-2"
        onClick={toggleList}
      >
        <span className="text-white">{title}</span>
        <CaretDownOutlined />
      </div>
      <div
        className={`absolute top-[calc(100%+5px)] transition-all left-0 h-auto z-10 dark:bg-main-dark bg-light rounded-btn-border px-2 py-2 ${
          show ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const DropdownList = ({ value, options = [], onChange, elements }) => {
  const [show, setShow] = useState(false);
  const toggleList = () => {
    setShow((prev) => !prev);
  };

  const label = useMemo(() => {
    console.log({ options, value });
    return options.find((o) => o.value === value)?.label || '';
  }, [value, options]);

  return (
    <DropdownWrapper title={label || value} toggleList={toggleList} show={show}>
      {!!options &&
        options.map((el) => {
          return (
            <div
              className={`dark:text-white text-dark cursor-pointer mb-2 px-2 pb-1 hover:bg-main-light hover:text-white rounded-btn-border transition-all ${
                value === el.value ? 'bg-main-light text-white' : ''
              }`}
              key={el.label}
              onClick={(e) => {
                onChange(el.value);
                toggleList();
              }}
            >
              {el.label}
            </div>
          );
        })}
      {!!elements && elements}
    </DropdownWrapper>
  );
};

export const DropdownBlock = ({ title, children }) => {
  const [show, setShow] = useState(false);
  const toggleList = () => {
    setShow((prev) => !prev);
  };
  return (
    <DropdownWrapper title={title} toggleList={toggleList} show={show}>
      {children}
    </DropdownWrapper>
  );
};

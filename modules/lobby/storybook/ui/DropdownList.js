import { CaretDownOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';

const DropdownWrapper = ({ title, children, show, toggleList }) => {
  return (
    <div className="dropdown">
      <div className="dropdown-label" onClick={toggleList}>
        <span className="label">{title}</span>
        <CaretDownOutlined />
      </div>
      <div className={`dropdown-list ${show ? 'show' : ''}`}>{children}</div>
    </div>
  );
};

export const DropdownList = ({ value, options = [], onChange }) => {
  const [show, setShow] = useState(false);
  const toggleList = () => {
    setShow((prev) => !prev);
  };

  const label = useMemo(() => {
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

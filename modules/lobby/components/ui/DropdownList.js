import { CaretDownOutlined } from '@ant-design/icons';
import { useState } from 'react';

const DropdownList = ({ defaultValue, options, onChange, elements, title }) => {
  const [show, setShow] = useState(false);
  const [activeText, setActiveText] = useState(
    defaultValue ? defaultValue : ''
  );

  const toggleList = () => {
    setShow((prev) => !prev);
  };

  const changeActiveText = (e) => {
    setActiveText(e.target.textContent);
  };

  const handleChange = (value) => {
    if (typeof onChange === 'function') {
      onChange(value);
    }
  };

  return (
    <div className="px-1 py-[1px] relative dark:bg-main-dark bg-main border-main-light rounded-btn-border border-2">
      <div
        className="flex items-center cursor-pointer gap-x-2"
        onClick={toggleList}
      >
        <span className="text-white">{title ? title : activeText}</span>
        <CaretDownOutlined />
      </div>
      <div
        className={`absolute top-[calc(100%+5px)] transition-all left-0 h-auto z-10 dark:bg-main-dark bg-light rounded-btn-border px-2 py-2 ${
          show ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {!!options &&
          options.map((el) => {
            return (
              <div
                className={`dark:text-white text-dark cursor-pointer mb-2 px-2 pb-1 hover:bg-main-light hover:text-white rounded-btn-border transition-all ${
                  activeText === el.label ? 'bg-main-light text-white' : ''
                }`}
                key={el.label}
                onClick={(e) => {
                  changeActiveText(e);
                  handleChange({ value: el.value, label: el.label });
                  toggleList();
                }}
              >
                {el.label}
              </div>
            );
          })}
        {!!elements && elements}
      </div>
    </div>
  );
};

export default DropdownList;

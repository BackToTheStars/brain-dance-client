import { CaretDownOutlined } from '@ant-design/icons';
import { useState, useMemo, createContext, useContext } from 'react';
import { IntButton as Button } from '@/ui/button';
import { SIZE_MD } from '@/config/ui/size';

const DropdownWrapper = ({ title, children, show, toggleList, size }) => {
  return (
    <div className="dropdown-wrapper relative base-element">
      <Button onClick={toggleList} size={size}>
        {title}
        <CaretDownOutlined />
      </Button>
      <div
        // className={`dropdown-wrapper__panel base-element--${size} min-w-full absolute top-[calc(100%+5px)] transition-all left-0 h-auto z-10 px-1 py-1 ${
        //   show ? 'visible opacity-100' : 'invisible opacity-0'
        // }`}
        className={`dropdown-wrapper__panel min-w-full absolute top-[calc(100%+5px)] ${
          show ? 'block' : 'hidden'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const DropdownList = ({ value, options = [], onChange, size=SIZE_MD }) => {
  const [show, setShow] = useState(false);
  const toggleList = () => {
    setShow((prev) => !prev);
  };

  const label = useMemo(() => {
    return options.find((o) => o.value === value)?.label || '';
  }, [value, options]);

  return (
    <DropdownWrapper title={label || value} toggleList={toggleList} show={show} size={size}>
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

const DropDownContext = createContext({});
export const useDropDown = () => useContext(DropDownContext);

export const DropdownBlock = ({ title, children, ...props }) => {
  const [show, setShow] = useState(false);
  const toggleList = (e) => {
    e.preventDefault();
    setShow((prev) => !prev);
  };
  return (
    <DropdownWrapper
      title={title}
      toggleList={toggleList}
      show={show}
      {...props}
    >
      <DropDownContext.Provider value={{ show, setShow }}>
        {children}
      </DropDownContext.Provider>
    </DropdownWrapper>
  );
};

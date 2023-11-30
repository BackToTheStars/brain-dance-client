'use client';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/actions';
import { VerticalSplit, VerticalSplit2 } from '../ui/VerticalSplit';

const Sidebar = ({ children, isOpen, ...otherProps }) => {
  const [resize, setResize] = useState(0);
  const sidebarRef = useRef(null);

  const dispatch = useDispatch();
  const [params, setParams] = useState({
    maxWidth: 100,
    height: 100,
    left: otherProps?.right ? false : otherProps?.left,
    right: otherProps?.left ? false : true,
    contentPos: 'end',
    ...otherProps,
  });

  const [position, setPosition] = useState({
    left: params.left ? '-100%' : 'auto',
    right: params.right ? '-100%' : 'auto',
    height: Boolean(String(params.height))
      ? `${params.height}%`
      : `${params.height}px`,
    justifyContent: `${params.contentPos}`,
  });

  const style = {
    maxWidth: `${
      resize === 0 ? `calc(${params.maxWidth}% - 24px)` : `${resize}%`
    }`,
    height: `100%`,
  };

  const openSidebar = () => {
    if (isOpen) {
      if (params.left) {
        setPosition((prevPosition) => ({ ...prevPosition, left: '0%' }));
      }
      if (params.right) {
        setPosition((prevPosition) => ({ ...prevPosition, right: '0%' }));
      }
    }
  };

  const closeSidebar = () => {
    if (!isOpen && (params.left || params.right)) {
      setPosition((prevPosition) => ({
        ...prevPosition,
        left: params.left ? '-100%' : 'auto',
        right: params.right ? '-100%' : 'auto',
      }));
    }
  };

  useEffect(() => {
    openSidebar();

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isOpen && (params.left || params.right)) {
          setPosition((prevPosition) => ({
            ...prevPosition,
            left: params.left ? '-100%' : 'auto',
            right: params.right ? '-100%' : 'auto',
          }));
          dispatch(toggleSidebar());
        }
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className="flex w-full h-full top-0 absolute transition-all z-50"
      id="main-sidebar"
      style={position}
    >
      <div
        className={`absolute left-0 top-0 w-full h-full bg-dark bg-opacity-50 transition-all duration-700 delay-150 ${
          position.left === '0%' || position.right === '0%'
            ? 'opacity-[1]'
            : 'opacity-0'
        }`}
        style={{ filter: `grayscale(1)`, backdropFilter: `blur(1px)` }}
      ></div>
      <div style={style} className="w-full relative">
        <VerticalSplit
          resize={setResize}
          minW={50}
          maxW={100}
          element="#main-sidebar"
        />
        <div
          className="absolute right-[12px] top-[8px] text-xl cursor-pointer"
          onClick={() => dispatch(toggleSidebar())}
        >
          ✕
        </div>
        <div ref={sidebarRef} className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

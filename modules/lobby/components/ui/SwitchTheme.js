import { useEffect, useState } from 'react';
import Button from './Button';
import { useDispatch, useSelector } from 'react-redux';
import { switchTheme } from '../../redux/actions';

export const ThemeSwitcher = () => {
  const theme = useSelector((s) => s.lobby.textSettings.theme);
  const dispatch = useDispatch();

  const toggleTheme = () => {
    dispatch(switchTheme());
  };

  useEffect(() => {
    if (!document) return;
    const html = document.querySelector('html');

    if (theme !== localStorage.getItem('theme')) {
      dispatch(switchTheme());
    }

    html.classList.add(theme);
  }, []);

  return (
    <Button
      link={'#'}
      title={theme === 'light' ? 'dark' : 'light'}
      onClick={(e) => {
        e.preventDefault();
        toggleTheme();
      }}
      className={`lg:px-3 sm:w-auto dark:text-white text-dark-light text-opacity-80`}
    />
  );
};

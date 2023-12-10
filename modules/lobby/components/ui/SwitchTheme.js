import { useEffect, useState } from 'react';
import Button from './Button';
// import { useDispatch } from 'react-redux';
// import { switchTheme } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { switchTheme } from '../../redux/actions';

export const useTheme = () => {
  const theme = useSelector((s) => s.lobby.textSettings.theme);
  const dispatch = useDispatch();
  const [html, setHtml] = useState(null);

  const toggleTheme = () => {
    dispatch(switchTheme());
    localStorage.setItem('theme', theme);
    if (html) {
      html.classList.remove(theme);
      html.classList.add(localStorage.getItem('theme'));
    }
  };

  useEffect(() => {
    if (!document) return;
    const html = document.querySelector('html');
    html.classList.add(
      localStorage.getItem('theme') ? localStorage.getItem('theme') : theme
    );

    setHtml(html);
  }, []);

  return {
    theme,
    toggleTheme,
  };
};

export const SwitchTheme = () => {
  const { toggleTheme } = useTheme();
  return (
    <Button
      link={'#'}
      title={'☀'}
      onClick={toggleTheme}
      className={`sm:flex-[0_0_60px] sm:h-[60px] py-2 lg:px-3 px-3 sm:w-auto w-full inline-block dark:text-white text-dark-light text-opacity-80 text-[35px]`}
    />
  );
};

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      link={'#'}
      title={theme ? 'dark' : 'light'}
      onClick={(e) => {
        e.preventDefault();
        toggleTheme();
      }}
      className={`lg:px-3 sm:w-auto dark:text-white text-dark-light text-opacity-80`}
    />
  );
};

// export const useTheme = () => {
//   const dispatch = useDispatch();
//   const [theme, setTheme] = useState(false);
//   const [html, setHtml] = useState(null);

//   const toggleTheme = () => {
//     setTheme((prevTheme) => {
//       const newTheme = !prevTheme;
//       localStorage.setItem('theme', newTheme ? 'dark' : 'light');
//       return newTheme;
//     });
//   };

//   useEffect(() => {
//     if (!localStorage) return;
//     const localTheme = localStorage.getItem('theme')
//       ? localStorage.getItem('theme')
//       : 'dark';
//     dispatch(switchTheme(localTheme));
//   }, [theme]);

//   return {
//     theme,
//     toggleTheme,
//   };
// };

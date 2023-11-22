import { useEffect, useState } from 'react';
import Button from './Button';
import { useDispatch } from 'react-redux';
import { switchTheme } from '../../redux/actions';

export const useTheme = () => {
  const [theme, setTheme] = useState(false);
  const [html, setHtml] = useState(null);

  const toggleTheme = () => {
    setTheme((prevTheme) => !prevTheme);

    localStorage.setItem('theme', theme ? 'light' : 'dark');
    if (html) {
      html.classList.remove(theme ? 'dark' : 'light');
      html.classList.add(localStorage.getItem('theme'));
    }
  };

  useEffect(() => {
    if (!document) return;
    const html = document.querySelector('html');
    html.classList.add(
      localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark'
    );
    setTheme(localStorage.getItem('theme') === 'dark');
    setHtml(html);
  }, []);

  return {
    toggleTheme,
  };
};

const SwitchTheme = () => {
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

export default SwitchTheme;

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

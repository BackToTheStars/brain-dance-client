export const ThemeStoryBook = ({ theme, toggleTheme }) => {
  const toggle = () => {
    toggleTheme(theme === 'dark' ? 'light' : 'dark');
  };
  return (
    <div
      className="bd-btn bd-btn-main bd-btn-border cursor-pointer"
      onClick={toggle}
    >
      {theme ? theme : 'dark'}
    </div>
  );
};

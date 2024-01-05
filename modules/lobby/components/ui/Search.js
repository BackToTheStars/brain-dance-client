const Search = ({
  clsInput,
  clsLabel,
  placeholder = 'Введите запрос поиска',
  showLabel = true,
}) => {
  return (
    <form className="form w-full">
      <div className="form-group relative w-full">
        {showLabel && (
          <label
            htmlFor="search_input"
            className={`absolute sm:left-[32px] sm:top-[-12px] top-[-8px] left-[6px] dark:bg-dark bg-light px-3 dark:text-main-text text-dark sm:text-base text-xs ${clsLabel}`}
          >
            Поиск
          </label>
        )}
        <input
          type="text"
          id="search_input"
          placeholder={placeholder}
          className={`border-2 border-main rounded-btn-border outline-none bg-transparent w-full ${clsInput}`}
          // className={`border-2 border-main px-8 sm:py-4 py-3 rounded-btn-border outline-none bg-transparent w-full ${clsInput}`}
        />
      </div>
    </form>
  );
};

export default Search;

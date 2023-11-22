const Search = ({ clsInput, clsLabel }) => {
  return (
    <form className="form w-full">
      <div className="form-group relative w-full">
        <label
          htmlFor="search_input"
          className={`absolute sm:left-[32px] sm:top-[-12px] top-[-8px] left-[6px] dark:bg-dark bg-white px-3 text-main-text sm:text-base text-xs ${clsLabel}`}
        >
          Поиск
        </label>
        <input
          type="text"
          id="search_input"
          placeholder="Введите запрос поиска"
          className={`border-2 border-main px-8 sm:py-4 py-3 rounded-btn-border outline-none bg-transparent w-full ${clsInput}`}
        />
      </div>
    </form>
  );
};

export default Search;

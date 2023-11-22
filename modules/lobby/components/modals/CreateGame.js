import Button from '../ui/Button';

const CreateGame = () => {
  return (
    <form className="w-full h-full bg-black py-6 flex flex-col">
      <div className="flex gap-6">
        <div className="flex items-center gap-x-1">
          <div class="bg-white dark:bg-gray-100 rounded-full w-4 h-4 flex flex-shrink-0 justify-center items-center relative">
            <input
              id="label1"
              type="radio"
              name="radio"
              class="checkbox appearance-none focus:opacity-100 focus:ring-2 focus:ring-offset-2 focus:ring-main focus:outline-none border rounded-full border-gray-400 absolute cursor-pointer w-full h-full checked:border-none "
              checked
            />
            <div class="check-icon hidden border-4 border-main rounded-full w-full h-full z-1"></div>
          </div>
          <label
            htmlFor="label1"
            class="ml-2 text-xl leading-4 font-normal text-white dark:text-gray-100"
          >
            Публичная игра
          </label>
        </div>
        <div className="flex items-center gap-x-1">
          <div class="bg-white dark:bg-gray-100 rounded-full w-4 h-4 flex flex-shrink-0 justify-center items-center relative">
            <input
              id="label2"
              type="radio"
              name="radio"
              class="checkbox appearance-none focus:opacity-100 focus:ring-2 focus:ring-offset-2 focus:ring-main focus:outline-none border rounded-full border-gray-400 absolute cursor-pointer w-full h-full checked:border-none"
            />
            <div class="check-icon hidden border-4 border-main rounded-full w-full h-full z-1"></div>
          </div>
          <label
            htmlFor="label2"
            class="ml-2 text-xl leading-4 font-normal text-white dark:text-gray-100"
          >
            Приватная игра
          </label>
        </div>
      </div>
      <div className="w-100 my-auto">
        <div className="relative">
          <label
            htmlFor="search_input"
            className="absolute left-[32px] text-xl top-[-12px] bg-black px-3 text-main-text"
          >
            Название игры
          </label>
          <input
            className="border-2 border-main px-8 py-6 rounded-full outline-none bg-transparent w-full"
            type="text"
            name="name-game"
            id="name-game"
          />
        </div>
      </div>
      <div className="text-end">
        <Button title="Отмена" className={'py-4'} />
        <Button title="Создать игру" className={'ms-6 py-4'} />
      </div>
    </form>
  );
};

export default CreateGame;

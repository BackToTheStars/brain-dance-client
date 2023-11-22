import Button from '../ui/Button';
import Search from '../ui/Search';

const SidebarGames = ({ game }) => {
  const { title, image, description, status, turns } = game;
  return (
    <div className="flex flex-col h-full dark:bg-dark-light bg-light rounded p-4">
      <div className="flex items-center gap-x-4">
        <div className="w-[50px] h-[50px] flex-[0_0_auto] inline-flex items-center justify-center rounded-btn-border border-2 border-main bg-main bg-opacity-10">
          {status === 'Открыт' ? (
            <img
              src="/icons/open.png"
              className="w-[25px] h-[25px] object-contain"
            ></img>
          ) : (
            <img
              src="/icons/close.png"
              className="w-[25px] h-[25px] object-contain"
            ></img>
          )}
        </div>
        <div className="text-xl font-semibold w-full pe-10 leading-[1.2]">
          {!!title && title}
        </div>
      </div>
      <div className="mt-4">
        <div className="relative w-full h-[350px]">
          {!!image && (
            <img
              className="w-full h-full object-cover object-center rounded"
              src={`${image}`}
              alt="image"
            />
          )}
          <div className="w-full h-auto flex gap-x-1 absolute bottom-5 left-0 px-3">
            <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
              <div className="text-center font-semibold">Номер</div>
              {!!turns && turns}
            </div>
            <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
              <div className="text-center font-semibold">Ходы</div>
              {!!turns && turns}
            </div>
            <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
              <div className="text-center font-semibold">Просмотры</div>
              {!!turns && turns}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <Search clsInput={'sm:py-3'} clsLabel={'dark:bg-dark-light'} />
      </div>
      <div className="mt-6">{!!description && description}</div>
      <div className="mt-auto">
        <Button className={'w-full py-3'} title={'Подробнее'} />
      </div>
    </div>
  );
};

export default SidebarGames;

import Search from '@/modules/lobby/components/ui/Search';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openSliderModal, toggleSidebar } from '../../redux/actions';
import { SLIDER_MODAL_GAME } from '@/config/lobby/modal';

const LeftContent = ({ games }) => {
  const dispatch = useDispatch();

  return (
    <div className={`rounded h-full flex flex-col dark:bg-dark bg-white`}>
      {/* <div className="mb-3 pt-[7px]">
        <Search />
      </div> */}
      <div className="dark:bg-dark-light bg-light flex-[0_1_100%] rounded overflow-y-auto sm:px-8 sm:pb-8 p-3">
        <div className="w-full flex sm:gap-6 gap-3 sm:pb-4 pb-3 sm:pt-3 border-b-2 dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 static top-0 dark:bg-dark-light bg-light">
          <div className="flex-[0_0_30px] flex sm:justify-center dark:text-white text-dark-light sm:text-xl text-base font-bold">
            №
          </div>
          <div className="flex-[0_1_100%] dark:text-white text-dark-light sm:text-xl text-sm font-bold">
            <Search showLabel={false} clsInput={'sm:py-1 sm:px-2'} placeholder="Название" />
          </div>
          <div className="sm:flex-[0_0_100px] flex-[0_0_60px] flex justify-center dark:text-white text-dark-light sm:text-xl text-sm font-bold">
            Ходы
          </div>
          <div className="sm:flex-[0_0_100px] flex-[0_0_60px] flex justify-center dark:text-white text-dark-light sm:text-xl text-sm font-bold">
            Статус
          </div>
        </div>

        <div className="flex flex-col select-none">
          {games.map((el, index) => {
            return (
              <div
                className="w-full flex items-center sm:gap-6 gap-3 pb-[12px] pt-[12px] border-b-2 dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10"
                key={index}
              >
                <div
                  className="w-[30px] h-[30px] flex-[0_0_30px] flex justify-center items-center  rounded-full border border-main font-bold sticky top-[100px]"
                  key={index}
                >
                  <span className="sm:text-[12px] text-[12px] dark:text-white text-dark-light">
                    {index + 1}
                  </span>
                </div>
                <div
                  className="flex-[0_1_100%] sm:text-xl text-[15px] dark:text-white text-dark-light cursor-pointer game-item"
                  onClick={() => {
                    dispatch(
                      openSliderModal(SLIDER_MODAL_GAME, {
                        title: el.title,
                      })
                    );
                  }}
                >
                  {el.title}
                </div>
                <div
                  className={`sm:flex-[0_0_100px] flex-[0_0_60px] flex justify-center items-center dark:text-white text-dark-light md:text-lg text-[14px]`}
                >
                  {el.turns}
                </div>
                <div
                  className={`sm:flex-[0_0_100px] flex-[0_0_60px] flex justify-center items-center dark:text-white text-dark-light md:text-lg text-[14px]`}
                >
                  {el.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default LeftContent;

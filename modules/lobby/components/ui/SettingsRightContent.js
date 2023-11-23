import { useState } from 'react';
import Button from './Button';
import {
  SettingIcon,
  TextCenterIcon,
  TextLeftIcon,
  TextRightIcon,
} from '../iconsComponents/SvgIcons.js';

const SettingsRightContent = () => {
  const [openList, setOpenList] = useState(false);
  const btnStyle =
    'w-[40px] h-[40px] border border-main rounded-btn-border leading-[1] flex items-center justify-center';

  const toggleList = () => {
    setOpenList((prev) => !prev);
  };

  return (
    <div className="relative">
      <Button
        title={<SettingIcon />}
        className={
          'sm:h-[60px] sm:w-[60px] w-[45px] h-[45px] lg:px-4 px-2 text-2xl'
        }
        onClick={toggleList}
      />
      <div
        className={`absolute top-0 right-[calc(100%+10px)] rounded-btn-border border-2 border-main z-10 w-[380px] p-4 bg-dark-light ${
          openList ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <form>
          <div className="text-lg font-semibold mb-5">Текст</div>
          <div className="cursor-pointer py-3 border-y border-white border-opacity-10 flex justify-between items-center">
            <div>Количество строк</div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`}>-</div>
              <div className="w-[36px] h-full text-center">15</div>
              <div className={`${btnStyle}`}>+</div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y border-white border-opacity-10 flex justify-between items-center">
            <div>Размер шрифта</div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`}>A-</div>
              <div className="w-[36px] h-full text-center">20</div>
              <div className={`${btnStyle}`}>A+</div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y border-white border-opacity-10 flex justify-between items-center">
            <div>Междустрочный интервал</div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`}>+</div>
              <div className="w-[36px] h-full text-center">90%</div>
              <div className={`${btnStyle}`}>-</div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y border-white border-opacity-10 flex justify-between items-center">
            <div>Выравнивание текста</div>
            <div className="flex gap-x-[10px] items-center">
              <div className={`${btnStyle}`}>
                <TextLeftIcon />
              </div>
              <div className={`${btnStyle}`}>
                <TextCenterIcon />
              </div>
              <div className={`${btnStyle}`}>
                <TextRightIcon />
              </div>
            </div>
          </div>
          <Button title={'Сохранить'} className={'w-full py-3 mt-4'} />
        </form>
      </div>
    </div>
  );
};

export default SettingsRightContent;

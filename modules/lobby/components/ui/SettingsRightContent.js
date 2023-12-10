import { useEffect, useMemo, useState } from 'react';
import Button from './Button';
import {
  SettingIcon,
  TextCenterIcon,
  TextLeftIcon,
  TextRightIcon,
} from '../iconsComponents/SvgIcons.js';
import { useDispatch, useSelector } from 'react-redux';
import { changeTextSettings } from '../../redux/actions';
import { fontSettings } from '@/config/lobby/fonts';
import { ThemeSwitcher } from './SwitchTheme';
import { SettingOutlined } from '@ant-design/icons';

const SettingsRightContent = () => {
  const dispatch = useDispatch();
  const lineCount = useSelector((s) => s.lobby.textSettings.lineCount);
  const fontSize = useSelector((s) => s.lobby.textSettings.fontSize);
  const lineSpacing = useSelector((s) => s.lobby.textSettings.lineSpacing);
  const cardPadding = useSelector((s) => s.lobby.textSettings.padding);
  const activeFontFamily = useSelector(
    (s) => s.lobby.textSettings.activeFontFamily
  );
  const limitLineHeader = useSelector(
    (s) => s.lobby.textSettings.limitLineHeader
  );

  const incLineCount = () =>
    lineCount < 30 && dispatch(changeTextSettings('lineCount', lineCount + 1));
  const decLineCount = () =>
    lineCount > 5 && dispatch(changeTextSettings('lineCount', lineCount - 1));

  const incFontSize = () =>
    fontSize < 30 && dispatch(changeTextSettings('fontSize', fontSize + 1));
  const decFontSize = () =>
    fontSize > 10 && dispatch(changeTextSettings('fontSize', fontSize - 1));

  const incCardPadding = () => {
    cardPadding < 24 &&
      dispatch(changeTextSettings('padding', cardPadding + 1));
  };

  const decCardPadding = () => {
    cardPadding > 10 &&
      dispatch(changeTextSettings('padding', cardPadding - 1));
  };

  const incLineSpacing = () =>
    lineSpacing < 3 &&
    dispatch(
      changeTextSettings('lineSpacing', Math.round(lineSpacing * 10 + 1) / 10)
    );

  const decLineSpacing = () =>
    lineSpacing > 0.5 &&
    dispatch(
      changeTextSettings('lineSpacing', Math.round(lineSpacing * 10 - 1) / 10)
    );

  const incLimitLineHeader = () =>
    limitLineHeader < 5 &&
    dispatch(changeTextSettings('limitLineHeader', limitLineHeader + 1));

  const decLimitLineHeader = () =>
    limitLineHeader > 1 &&
    dispatch(changeTextSettings('limitLineHeader', limitLineHeader - 1));

  const setAlignment = (type) => {
    dispatch(changeTextSettings('alignment', type));
  };

  const fontFamilyOptions = useMemo(() => {
    return Object.keys(fontSettings).map((field) => ({
      ...fontSettings[field],
      active: field === activeFontFamily,
      key: field,
    }));
  }, [activeFontFamily]);

  const setActiveFontFamily = (fontFamily) => {
    dispatch(changeTextSettings('activeFontFamily', fontFamily));
  };

  const [openList, setOpenList] = useState(false);
  const btnStyle =
    'w-[40px] h-[40px] border border-main rounded-btn-border leading-[1] flex items-center justify-center select-none dark:text-white text-dark';

  const toggleList = (e) => {
    e.preventDefault();
    setOpenList((prev) => !prev);
  };

  return (
    <div className="relative">
      <Button
        title={<SettingOutlined className="text-[18px]" />}
        className={
          'sm:h-[30px] sm:w-[36px] w-[36px] h-[30px] lg:px-4 px-2 text-2xl'
        }
        onClick={toggleList}
      />
      <div
        className={`absolute top-0 right-[calc(100%+10px)] rounded-btn-border border-2 border-main z-10 w-[380px] p-4 dark:bg-dark-light bg-light ${
          openList ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <form>
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-semibold dark:text-white text-dark">
              Настройки
            </div>
            <ThemeSwitcher />
          </div>
          <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
            <div className="dark:text-white text-dark">Отступы</div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`} onClick={decCardPadding}>
                -
              </div>
              <div className="w-[36px] h-full text-center dark:text-white text-dark font-medium">
                {cardPadding}
              </div>
              <div className={`${btnStyle}`} onClick={incCardPadding}>
                +
              </div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
            <div className="dark:text-white text-dark">
              Кол-во строк оглавления
            </div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`} onClick={decLimitLineHeader}>
                -
              </div>
              <div className="w-[36px] h-full text-center dark:text-white text-dark font-medium">
                {limitLineHeader}
              </div>
              <div className={`${btnStyle}`} onClick={incLimitLineHeader}>
                +
              </div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
            <div className="dark:text-white text-dark">Кол-во строк</div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`} onClick={decLineCount}>
                -
              </div>
              <div className="w-[36px] h-full text-center dark:text-white text-dark font-medium">
                {lineCount}
              </div>
              <div className={`${btnStyle}`} onClick={incLineCount}>
                +
              </div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
            <div className="dark:text-white text-dark">Размер шрифта</div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`} onClick={decFontSize}>
                A-
              </div>
              <div className="w-[36px] h-full text-center dark:text-white text-dark font-medium">
                {fontSize}
              </div>
              <div className={`${btnStyle}`} onClick={incFontSize}>
                A+
              </div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
            <div className="dark:text-white text-dark">
              Междустрочный интервал
            </div>
            <div className="flex gap-x-3 items-center">
              <div className={`${btnStyle}`} onClick={decLineSpacing}>
                -
              </div>
              <div className="w-[36px] h-full text-center dark:text-white text-dark font-medium">
                {Math.round(lineSpacing * 100)}%
              </div>
              <div className={`${btnStyle}`} onClick={incLineSpacing}>
                +
              </div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
            <div className="dark:text-white text-dark">Выравнивание текста</div>
            <div className="flex gap-x-[10px] items-center">
              <div
                className={`${btnStyle}`}
                onClick={() => setAlignment('left')}
              >
                <TextLeftIcon />
              </div>
              <div
                className={`${btnStyle}`}
                onClick={() => setAlignment('justify')}
              >
                <TextCenterIcon />
              </div>
              <div
                className={`${btnStyle}`}
                onClick={() => setAlignment('right')}
              >
                <TextRightIcon />
              </div>
            </div>
          </div>
          <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
            <div className="dark:text-white text-dark">Шрифт</div>
            <div className="flex gap-x-3 items-center">
              <ul>
                {fontFamilyOptions.map((el) => {
                  return (
                    <li
                      className={`dark:text-white text-dark ${
                        el.active ? 'dark:text-main text-main' : ''
                      }`}
                      key={el.label}
                      onClick={() => setActiveFontFamily(el.key)}
                    >
                      {el.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsRightContent;

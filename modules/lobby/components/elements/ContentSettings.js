import { useMemo } from 'react';
import {
  TextCenterIcon,
  TextLeftIcon,
  TextRightIcon,
} from '@/modules/lobby/components/iconsComponents/SvgIcons';
import { useDispatch, useSelector } from 'react-redux';
import { changeTextSettings } from '@/modules/lobby/redux/actions';
import { fontSettings } from '@/config/lobby/fonts';
// import { ThemeSwitcher } from './SwitchTheme';
import { Slider } from 'antd';
import SwitchersBlock from './SwitchersBlock';
import ModeToggle from '@/modules/ui/components/switchers/ModeToggle';

const ContentSettings = () => {
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

  const changeLineCount = (newValue) => {
    dispatch(changeTextSettings('lineCount', newValue));
  };

  // const incLineCount = () =>
  //   lineCount < 30 && dispatch(changeTextSettings('lineCount', lineCount + 1));
  // const decLineCount = () =>
  //   lineCount > 5 && dispatch(changeTextSettings('lineCount', lineCount - 1));

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

  // const btnStyle =
  //   'w-[40px] h-[40px] border border-main rounded-btn-border leading-[1] flex items-center justify-center select-none';
  const btnStyle =
    'w-[30px] h-[30px] border border-main rounded-btn-border leading-[1] flex items-center justify-center select-none';

  return (
    <form>
      <div className="flex justify-between items-center mb-3">
        <div className="text-lg font-semibold">
          Настройки
        </div>
        {/* <ThemeSwitcher /> */}
        <ModeToggle />
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
        <div className="text-dark">Отступы</div>
        <div className="flex gap-x-3 items-center w-[120px]">
          <div className={`${btnStyle}`} onClick={decCardPadding}>
            -
          </div>
          <div className="w-[36px] h-full text-center font-medium">
            {cardPadding}
          </div>
          <div className={`${btnStyle}`} onClick={incCardPadding}>
            +
          </div>
        </div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
        <div className="text-dark">Кол-во строк оглавления</div>
        <div className="flex gap-x-3 items-center w-[120px]">
          <div className={`${btnStyle}`} onClick={decLimitLineHeader}>
            -
          </div>
          <div className="w-[36px] h-full text-center font-medium">
            {limitLineHeader}
          </div>
          <div className={`${btnStyle}`} onClick={incLimitLineHeader}>
            +
          </div>
        </div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
        <div className="text-dark">Кол-во строк</div>
        <div className="flex gap-x-3 items-center w-[120px]">
          <div className="w-[140px] h-full text-center font-medium">
            <Slider
              min={5}
              max={30}
              onChange={changeLineCount}
              value={typeof lineCount === 'number' ? lineCount : 0}
            />
          </div>
        </div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
        <div className="text-dark">Размер шрифта</div>
        <div className="flex gap-x-3 items-center w-[120px]">
          <div className={`${btnStyle}`} onClick={decFontSize}>
            A-
          </div>
          <div className="w-[36px] h-full text-center font-medium">
            {fontSize}
          </div>
          <div className={`${btnStyle}`} onClick={incFontSize}>
            A+
          </div>
        </div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
        <div className="text-dark">Междустрочный интервал</div>
        <div className="flex gap-x-3 items-center w-[120px]">
          <div className={`${btnStyle}`} onClick={decLineSpacing}>
            -
          </div>
          <div className="w-[36px] h-full text-center font-medium">
            {Math.round(lineSpacing * 100)}%
          </div>
          <div className={`${btnStyle}`} onClick={incLineSpacing}>
            +
          </div>
        </div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
        <div className="text-dark">Выравнивание текста</div>
        <div className="flex gap-x-[10px] items-center justify-between w-[120px]">
          <div className={`${btnStyle}`} onClick={() => setAlignment('left')}>
            <TextLeftIcon />
          </div>
          <div
            className={`${btnStyle}`}
            onClick={() => setAlignment('justify')}
          >
            <TextCenterIcon />
          </div>
          <div className={`${btnStyle}`} onClick={() => setAlignment('right')}>
            <TextRightIcon />
          </div>
        </div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center">
        <div className="text-dark">Шрифт</div>
        <div className="flex gap-x-3 items-center w-[120px]">
          <ul>
            {fontFamilyOptions.map((el) => {
              return (
                <li
                  className={` ${
                    el.active
                      ? 'dark:text-main-light text-main-light'
                      : 'text-dark'
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
      <SwitchersBlock />
    </form>
  );
};

export default ContentSettings;

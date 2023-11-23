'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/modules/lobby/components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import TurnCard from '../turns/Card';
import { loadTurns, switchMode } from '../../redux/actions';
import SettingsRightContent from '../ui/SettingsRightContent';
import { GridIcon } from '../iconsComponents/SvgIcons';

const DEFAULT_GRID_WIDTH = 1200;
const DEFAULT_COLS = 2;
const MIN_TURN_WIDTH = 200;

const factor = (index) => {
  let elements = [];
  for (let i = 0; i <= index; i++) {
    elements.push(
      <span
        key={`grid${i + index}`}
        className={
          'w-[15px] select-none inline-block h-[15px] dark:bg-white bg-dark-light dark:bg-opacity-50 bg-opacity-50 rounded-btn-border'
        }
      ></span>
    );
  }
  return elements;
};

const RightContent = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state)=> state.lobby.mode)
  const turnsGridRef = useRef();
  const turns = useSelector((s) => s.lobby.turns);
  // @todo: get default width by props
  const [gridWidth, setGridWidth] = useState(DEFAULT_GRID_WIDTH);

  const [displayVariantGridList, setDisplayVariantGridList] = useState(false);
  const [desiredNumCols, setDesiredNumCols] = useState(DEFAULT_COLS);

  const variantGrid = useMemo(() => {
    return new Array(Math.floor(gridWidth / MIN_TURN_WIDTH)).fill(0);
  }, [gridWidth]);

  const numCols = useMemo(() => {
    return Math.min(variantGrid.length, desiredNumCols);
  }, [desiredNumCols, variantGrid]);

  const images = useMemo(() => {
    const arrImg = new Array(numCols).fill(null).map(() => []);
    const imgCount = 18;
    const delta = Math.floor(imgCount / numCols);
    for (let i = 0; i < delta; i += 1) {
      for (let j = 0; j < numCols; j += 1) {
        arrImg[j].push(i * numCols + j + 1);
      }
    }
    return arrImg;
  }, [numCols]);

  const turnGroups = useMemo(() => {
    const arrTurns = new Array(numCols).fill(null).map(() => []);
    const delta = Math.floor(turns.length / numCols);
    for (let i = 0; i < delta; i += 1) {
      for (let j = 0; j < numCols; j += 1) {
        arrTurns[j].push(turns[i * numCols + j]);
      }
    }
    return arrTurns;
  }, [numCols, turns]);

  const widthCol = 100 / numCols;

  useEffect(() => {
    if (!document && !window) return;

    const clickToDocument = (e) => {
      if (
        e.target.tagName === 'IMG' ||
        e.target.tagName === 'A' ||
        e.target.tagName === 'LI' ||
        e.target.tagName === 'SPAN'
      )
        return;
      setDisplayVariantGridList(false);
    };

    if (displayVariantGridList) {
      document.addEventListener('click', clickToDocument);
    } else {
      document.removeEventListener('click', clickToDocument);
    }
  }, [displayVariantGridList]);

  useEffect(() => {
    if (!turnsGridRef.current) return;
    const outputsize = () => {
      setGridWidth(turnsGridRef.current.offsetWidth);
    };
    outputsize();
    const resizeObserver = new ResizeObserver(outputsize);
    resizeObserver.observe(turnsGridRef.current);
    return () =>
      turnsGridRef.current && resizeObserver?.unobserve(turnsGridRef.current);
  }, [turnsGridRef]);

  useEffect(() => {
    dispatch(loadTurns());
  }, [mode]);

  return (
    <div className={'flex flex-col h-full'} ref={turnsGridRef}>
      <div className={`flex justify-between items-center gap-x-4`}>
        <div className={'flex items-center mb-3 pt-[7px] gap-x-3'}>
          <Button
            onClick={(e) => {
              e.preventDefault();
              dispatch(switchMode('byGame'));
            }}
            title={
              <img
              src="/icons/calendar-icon.svg"
              className={'sm:w-[30px] w-[25px]'}
              alt="icon"
              />
            }
            className={'sm:h-[60px] sm:w-[60px] w-[45px] h-[45px] lg:px-4 px-2'}
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              dispatch(switchMode('chrono'));
            }}
            title={
              <img
              src="/icons/step-icon.svg"
              className={'sm:w-[30px] w-[25px]'}
              alt="icon"
              />
            }
            className={'sm:h-[60px] sm:w-[60px] w-[45px] h-[45px] lg:px-4 px-2'}
          />
        </div>
        <div className={'relative md:block hidden ms-auto'}>
          <Button
            title={<GridIcon />}
            className={'sm:h-[60px] sm:w-[60px] w-[45px] h-[45px] lg:px-4 px-2'}
            onClick={() => {
              setDisplayVariantGridList((prev) => !prev);
            }}
          />
          <ul
            className={`${
              displayVariantGridList ? 'visible' : 'hidden'
            } rounded-btn-border dark:bg-dark-light bg-light border border-main absolute flex flex-col gap-y-2 gap-x-4 right-[calc(100%+12px)] top-0 z-[1]`}
          >
            {variantGrid.map((el, index) => {
              return (
                <li
                  className={`flex items-center px-3 py-2 rounded-btn-border justify-center gap-x-3 cursor-pointer ${
                    numCols === index + 1 ? 'bg-main' : ''
                  }`}
                  onClick={() => setDesiredNumCols(index + 1)}
                  key={index}
                >
                  {factor(index)}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <SettingsRightContent />
        </div>
      </div>
      <div
        className={`flex flex-wrap gap-x-6 overflow-y-auto h-full rounded select-none flex-[0_1_100%]`}
      >
        {turnGroups.map((innerTurns, i) => {
          return (
            <div
              key={i}
              style={{ width: `calc(${widthCol}% - 24px)` }}
              className={`flex flex-col gap-y-6 w-[calc(${widthCol}%-24px)] transition-all duration-500`}
            >
              {innerTurns.map((turn) => {
                return (
                  <div key={turn._id}>
                    <TurnCard turn={turn} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RightContent;

{
  /* <div className='absolute bottom-[-60px] border-2 border-main right-3 w-[60px] h-[60px] rounded bg-dark-light bg-opacity-90 group-hover/item:bottom-[60px] transition-all'>
                                <Link
                                    href={'#'}
                                    className='h-full w-full flex items-center justify-center'
                                >
                                    <svg
                                        width='30'
                                        height='30'
                                        viewBox='0 0 57 42'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M32.1383 33.0754L32.1375 42L57 21L32.1375 -3.04042e-06L32.1375 8.92463L-1.9801e-06 8.93225L-9.24771e-07 33.0754L32.1383 33.0754Z'
                                            className='fill-main'
                                        />
                                    </svg>
                                </Link>
                            </div> */
}

// <div
//     className={`grid 2xl:grid-cols-${numCols} transition-all xl:grid-cols-2 md:grid-cols-3 gap-x-6 overflow-y-auto h-full rounded select-none flex-[0_1_100%]`}>
//     <div className='flex flex-col gap-y-6'>
//         {images1.map(num => {
//             return (
//                 <div className={`relative w-full h-auto group/item`} key={num}>
//                     <img
//                         src={`/resources/games/${num}-min.jpg`}
//                         alt='#'
//                         className={`w-full h-auto rounded`}
//                     />
//                     <div
//                         className='absolute bottom-0 left-0 px-3 py-6 text-center text-xl backdrop-blur-md rounded-b font-bold w-full mix-blend-difference text-white'>
//                         <Link href={'#'}>Игра номер 1</Link>
//                     </div>
//                 </div>
//             )
//         })}
//     </div>
//     <div className='flex flex-col gap-y-6'>
//         {images2.map(num => {
//             return (
//                 <img
//                     key={num}
//                     src={`/resources/games/${num}-min.jpg`}
//                     className='w-full h-auto rounded'
//                     alt='#'
//                 />
//             )
//         })}
//     </div>
//     <div className='flex flex-col gap-y-6'>
//         {images3.map(num => {
//             return (
//                 <img
//                     key={num}
//                     src={`/resources/games/${num}-min.jpg`}
//                     className='w-full h-auto rounded'
//                     alt='#'
//                 />
//             )
//         })}
//     </div>
// </div>

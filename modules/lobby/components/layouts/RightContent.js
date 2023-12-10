'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/modules/lobby/components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import TurnCard from '../turns/Card';
import { changeLayoutSettings, loadTurns, switchMode } from '../../redux/actions';
import SettingsRightContent from '../ui/SettingsRightContent';
import { GridIcon } from '../iconsComponents/SvgIcons';

const DEFAULT_GRID_WIDTH = 1200;
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

export const ContentToolbar = () => {
  const dispatch = useDispatch();
  const [gridWidth, setGridWidth] = useState(DEFAULT_GRID_WIDTH);

  const [displayVariantGridList, setDisplayVariantGridList] = useState(false);
  const desiredNumCols = useSelector(s => s.lobby.layoutSettings.desiredNumCols)

  const variantGrid = useMemo(() => {
    return new Array(Math.floor(gridWidth / MIN_TURN_WIDTH)).fill(0);
  }, [gridWidth]);

  const numCols = useMemo(() => {
    return Math.min(variantGrid.length, desiredNumCols);
  }, [desiredNumCols, variantGrid]);

  return (
    <div className={`flex justify-between items-center gap-x-4 w-full`}>
      <div className={'flex items-center mb-3 pt-[7px] gap-x-3'}>
        <SettingsRightContent />
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
          onClick={(e) => {
            e.preventDefault();
            setDisplayVariantGridList((prev) => !prev);
          }}
        />
        <ul
          className={`${
            displayVariantGridList ? 'visible' : 'hidden'
          } rounded-btn-border dark:bg-dark-light bg-light border border-main absolute flex flex-col gap-y-2 gap-x-4 right-[calc(100%+12px)] top-0 z-[2]`}
        >
          {variantGrid.map((el, index) => {
            return (
              <li
                className={`flex items-center px-3 py-2 rounded-btn-border justify-center gap-x-3 cursor-pointer ${
                  numCols === index + 1 ? 'bg-main' : ''
                }`}
                onClick={() => dispatch(changeLayoutSettings('desiredNumCols', index + 1))}
                key={index}
              >
                {factor(index)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const RightContent = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.lobby.mode);
  const turnsGridRef = useRef();
  const turns = useSelector((s) => s.lobby.turns);
  // @todo: get default width by props
  const [gridWidth, setGridWidth] = useState(DEFAULT_GRID_WIDTH);
  const desiredNumCols = useSelector(s => s.lobby.layoutSettings.desiredNumCols)

  const variantGrid = useMemo(() => {
    return new Array(Math.floor(gridWidth / MIN_TURN_WIDTH)).fill(0);
  }, [gridWidth]);

  const numCols = useMemo(() => {
    return Math.min(variantGrid.length, desiredNumCols);
  }, [desiredNumCols, variantGrid]);

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
    dispatch(loadTurns());
  }, [mode]);

  return (
    <div className={'flex flex-col h-full'} ref={turnsGridRef}>
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
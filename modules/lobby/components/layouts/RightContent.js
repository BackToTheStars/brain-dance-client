'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/modules/lobby/components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppstoreOutlined,
  CalendarOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import TurnCard from '../turns/Card';
import {
  changeLayoutSettings,
  loadTurns,
  switchMode,
} from '../../redux/actions';
import SettingsRightContent from '../ui/SettingsRightContent';
import { GridIcon } from '../iconsComponents/SvgIcons';
import { DropdownList, DropdownBlock } from '../ui/DropdownList';
import { contentTypes } from '@/config/lobby/contentType';
import { Slider } from 'antd';

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
  const activeContentType = useSelector(
    (s) => s.lobby.layoutSettings.contentType
  );
  const turnLimit = useSelector((s) => s.lobby.layoutSettings.turnLimit);

  const [displayVariantGridList, setDisplayVariantGridList] = useState(false);
  const desiredNumCols = useSelector(
    (s) => s.lobby.layoutSettings.desiredNumCols
  );

  const variantGrid = useMemo(() => {
    return new Array(Math.floor(gridWidth / MIN_TURN_WIDTH)).fill(0);
  }, [gridWidth]);

  const numCols = useMemo(() => {
    return Math.min(variantGrid.length, desiredNumCols);
  }, [desiredNumCols, variantGrid]);

  return (
    <div className={`flex justify-between items-center gap-x-4 w-full`}>
      <div className={'flex items-center gap-x-3'}>
        <SettingsRightContent />
        <Button
          onClick={(e) => {
            e.preventDefault();
            dispatch(switchMode('byGame'));
          }}
          title={<CalendarOutlined className="text-[16px]" />}
          className={'sm:h-[30px] sm:w-[30px] w-[26px] h-[26px] lg:px-4 px-2'}
        />
        <Button
          onClick={(e) => {
            e.preventDefault();
            dispatch(switchMode('chrono'));
          }}
          title={<BranchesOutlined className="text-[16px]" />}
          className={'sm:h-[30px] sm:w-[30px] w-[26px] h-[26px] lg:px-4 px-2'}
        />
        <DropdownList
          value={activeContentType}
          onChange={(value) => {
            dispatch(changeLayoutSettings('contentType', value));
          }}
          options={contentTypes}
        />
        <DropdownBlock title={turnLimit}>
          <Slider
            style={{ width: `100px` }}
            min={5}
            max={10}
            onChange={(value) =>
              dispatch(changeLayoutSettings('turnLimit', value))
            }
            value={+turnLimit || 0}
          />
        </DropdownBlock>
      </div>
      <div className={'relative md:block hidden ms-auto'}>
        <Button
          title={
            <AppstoreOutlined className="text-[16px] pointer-events-none" />
          }
          className={'sm:h-[30px] sm:w-[30px] w-[26px] h-[26px] lg:px-4 px-2'}
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
                onClick={() =>
                  dispatch(changeLayoutSettings('desiredNumCols', index + 1))
                }
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
  const desiredNumCols = useSelector(
    (s) => s.lobby.layoutSettings.desiredNumCols
  );

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

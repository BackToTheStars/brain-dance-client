'use client';
import { useMemo } from 'react';

// import Button from '../ui/Button';
import { IntButton as Button } from '@/ui/button';
import { useDispatch } from 'react-redux';
import { openModal } from '@/modules/ui/redux/actions';
import {
  MODAL_CREATE_GAME,
  MODAL_DONATE,
  MODAL_ENTER_GAME,
} from '@/config/lobby/modal';
import { TogglerPanel, TogglerWrapper } from '../ui/Toggler';
import ContentSettings from '../elements/ContentSettings';
import ColumnsSlider from '../controls/ColumnsSlider';
import { switchMode } from '@/modules/lobby/redux/actions';
import { BranchesOutlined, CalendarOutlined } from '@ant-design/icons';
import TurnListControls from '../controls/TurnListControls';

const Header = ({ leftSideWidth }) => {
  const dispatch = useDispatch();

  const leftSideStyle = useMemo(() => {
    return {
      width: leftSideWidth ? `${leftSideWidth + 16}px` : '50%',
      // width: leftSideWidth ? `${leftSideWidth}px` : `calc(50% - 4 * var(--block-padding-unit))`,
      // transition: 'width 0.05s linear',
    };
  }, [leftSideWidth]);
  return (
    <header className="lobby-block pt-4 flex justify-between">
      <div
        style={leftSideStyle}
        className="lobby-block flex gap-2 divider-r pb-2"
      >
        <Button size="sm" onClick={() => dispatch(openModal(MODAL_ENTER_GAME))}>
          Войти в игру
        </Button>
        <Button
          size="sm"
          onClick={() => dispatch(openModal(MODAL_CREATE_GAME))}
        >
          Создать игру
        </Button>
      </div>
      <div className="lobby-block flex gap-2 flex-1 justify-between pl-4 pb-2">
        <TogglerWrapper
          Button={({ toggle }) => (
            <Button onClick={toggle} size="sm">
              Настройки
            </Button>
          )}
          Panel={
            <TogglerPanel>
              <div className="base-card w-[350px]">
                <div className="base-card__body p-2">
                  <ContentSettings />
                </div>
              </div>
            </TogglerPanel>
          }
        />
        <ColumnsSlider />
        <TurnListControls />
        <div className="flex-1 flex gap-2">
          <Button
            size="sm"
            onClick={() => dispatch(switchMode('byGame'))}
          >
            <BranchesOutlined />
          </Button>
          <Button
            size="sm"
            onClick={() => dispatch(switchMode('chrono'))}
          >
            <CalendarOutlined />
          </Button>
        </div>
        {/* <ContentToolbar showSettings={false} /> */}
        {/* <Switchers /> */}
        <Button size="sm" onClick={() => dispatch(openModal(MODAL_DONATE))}>
          Поддержать
        </Button>
      </div>
    </header>
  );
};

export default Header;

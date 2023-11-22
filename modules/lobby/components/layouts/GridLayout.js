import { useEffect, useState } from 'react';
import Header from './Header';
import LeftContent from './LeftContent';
import RightContent from './RightContent';
import Button from '../ui/Button';
import VerticalSplit from '../ui/VerticalSplit';
import Sidebar from '../sidebars/Sidebar';
import SidebarGames from '../sidebars/SidebarGames';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/actions';

const GridLayout = () => {
  const [mobileSwitcherWidth, setMobileSwitcherWidth] = useState(false);
  const [activeGame, setActiveGame] = useState({});
  const { games } = useSelector((state) => state.lobby.section.leftContent);
  const [resize, setResize] = useState('');
  const [size, setSize] = useState(false);
  const sidebarOpen = useSelector((state) => state.lobby.sidebar);
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.innerWidth < 1280) {
      setSize('100%');
    }

    window.onresize = () => {
      if (window.innerWidth < 1280) {
        setSize(true);
      } else {
        setSize(false);
      }
    };
  }, []);

  return (
    <main className="main">
      <div className="sm:p-section-padding p-3 w-screen h-screen relative">
        <Header />
        <div
          className={`mt-6 pt-6 sm:border-t-2 dark:border-white border-dark-light dark:border-opacity-5 border-opacity-5 sm:h-[calc(100vh-60px-130px)] h-[calc(100vh-44px-48px)] relative`}
        >
          <div className="flex gap-x-9 h-full relative z-[1] overflow-hidden">
            <div
              className={`xl:w-1/2 w-full flex-[0_0_auto] relative ${
                mobileSwitcherWidth
                  ? 'invisible delay-150 transition-all'
                  : 'visible delay-0'
              }`}
              style={
                !size
                  ? {
                      width: `${
                        resize !== 0 ? `calc(${resize}% - 15px)` : `50%`
                      }`,
                    }
                  : { width: `100%` }
              }
            >
              <div
                className={`${
                  mobileSwitcherWidth
                    ? 'translate-x-[-100%]'
                    : 'translate-x-[0%]'
                } transition-all overflow-hidden h-full`}
              >
                <LeftContent games={games} activeGame={setActiveGame} />
              </div>
              <VerticalSplit resize={setResize} />
            </div>
            <div className="w-full h-full xl:relative absolute left-0 top-0 -z-10 rounded overflow-hidden">
              <RightContent />
              <Sidebar
                left={true}
                maxWidth={400}
                contentPos={'start'}
                isOpen={sidebarOpen.sidebarGame}
              >
                <SidebarGames game={activeGame} />
              </Sidebar>
            </div>
          </div>
          <div className="absolute z-10 sm:right-[-38px] right-0 sm:bottom-0 sm:top-auto top-[-13px] sm:h-[calc(100%-32px)] sm:w-auto w-full xl:hidden block">
            <Button
              title={`${mobileSwitcherWidth ? '🠚' : '🠘'}`}
              className={'sm:w-[30px] w-full rounded border-none h-full'}
              style={{ padding: 0 }}
              onClick={(e) => {
                e.preventDefault();
                setMobileSwitcherWidth(!mobileSwitcherWidth);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default GridLayout;

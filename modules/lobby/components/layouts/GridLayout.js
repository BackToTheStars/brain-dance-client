import { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import LeftContent from './LeftContent';
import RightContent from './RightContent';
import Button from '../ui/Button';
import { VerticalSplit } from '../ui/VerticalSplit';
import { useDispatch, useSelector } from 'react-redux';
import { loadGames } from '../../redux/actions';
import CommonSliderModal from '../sliderModals/CommonSliderModal';

const MIN_LEFT_SIDE_WIDTH = 400;

const GridLayout = () => {
  const settingsGame = useSelector((s) => s.settings.games);
  const [mobileSwitcherWidth, setMobileSwitcherWidth] = useState(false);
  const originalGames = useSelector((s) => s.lobby.games);
  const [minMaxDelta, setMinMaxDelta] = useState([null, null]);
  const [leftSideWidth, setLeftSideWidth] = useState(null);
  const dispatch = useDispatch();
  const move = (delta) => {
    if (typeof window === 'undefined') return;
    const [minDelta, maxDelta] = minMaxDelta;
    if (minDelta === null || maxDelta === null) return;
    if (delta > maxDelta) return;
    if (delta < minDelta) return;
    const middle = Math.floor(window.innerWidth / 2);
    if (leftSideWidth !== middle + delta) {
      setLeftSideWidth(middle + delta);
    }
  };

  const games = useMemo(() => {
    return originalGames.map((g) => ({
      title: g.name,
      turns: g.turnsCount,
      status: g.public ? 'public' : 'private',
      link: '#',
      image: g.image || '/img/game_screenshot.png',
      id: g._id,
      hash: g.hash,
    }));
  }, [originalGames]);

  useEffect(() => {
    setMinMaxDelta([
      -Math.floor(window.innerWidth / 2) + MIN_LEFT_SIDE_WIDTH,
      0,
    ]);
  }, []);

  useEffect(() => {
    dispatch(loadGames());
  }, [settingsGame]);

  return (
    <main className="main">
      {/* sm:p-section-padding */}
      <div className="flex flex-col s_p-2 w-screen h-screen relative overflow-hidden">
        <Header />
        <div
          // className={`s_mt-2 s_pt-2 sm:border-t-2 dark:border-white border-dark-light dark:border-opacity-5 border-opacity-5 sm:h-[calc(100vh-60px-60px)] h-[calc(100vh-44px-48px)] relative`}
          className={`flex-1 s_mt-2 sm:border-t-2 h-full dark:border-white border-dark-light dark:border-opacity-5 border-opacity-5 relative`}
        >
          <div className="flex gap-x-9 h-full relative z-[1] overflow-hidden">
            <div
              className={`s_mt-2 xl:w-1/2 w-full flex-[0_0_auto] relative ${
                mobileSwitcherWidth
                  ? 'invisible delay-150 transition-all'
                  : 'visible delay-0'
              }`}
              style={{
                transition: 'width 0.05s',
                width: leftSideWidth === null ? '50%' : leftSideWidth + 'px',
              }}
            >
              <div
                className={`${
                  mobileSwitcherWidth
                    ? 'translate-x-[-100%]'
                    : 'translate-x-[0%]'
                } transition-all overflow-hidden h-full`}
              >
                <LeftContent games={games} />
              </div>
              <VerticalSplit move={move} />
            </div>
            <div
              className="w-full h-full xl:relative absolute left-0 top-0 -z-10 overflow-hidden"
              id="right-content"
            >
              <RightContent />
              <CommonSliderModal />
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

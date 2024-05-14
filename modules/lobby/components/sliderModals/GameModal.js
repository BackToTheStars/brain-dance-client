import { useRef, useState } from 'react';
import { ContentButton as Button } from '@/ui/button';
import Search from '../ui/Search';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { VerticalSplit } from '../elements/VerticalSplit';
import { useRouter } from 'next/navigation';

const GameModal = ({ params }) => {
  const router = useRouter();
  const minMaxDelta = [-200, 200]; // @todo: get from redux
  const modalRef = useRef();
  const { hash, width: originalWidth } = params;
  const [width, setWidth] = useState(originalWidth);
  const game = useSelector((state) =>
    state.lobby.games.find((g) => g.hash === hash),
  );
  const { public: isPublic, name, image, turnsCount, description } = game;

  const move = (delta) => {
    if (typeof window === 'undefined') return;
    if (!modalRef.current) return;
    const [minDelta, maxDelta] = minMaxDelta;
    if (minDelta === null || maxDelta === null) return;
    if (delta > maxDelta) return;
    if (delta < minDelta) return;
    const { width: w } = modalRef.current.parentNode.getBoundingClientRect();
    const middle = Math.floor(w / 2); // @todo: get from redux
    if (width !== middle + delta) {
      setWidth(middle + delta);
    }
  };
  return (
    <>
      <div
        className="flex flex-col h-full dark:bg-dark-light bg-light rounded p-4 relative"
        style={{ maxWidth: '100%', width }}
        ref={modalRef}
      >
        <div className="flex items-center gap-x-4">
          <div className="w-[30px] h-[30px] flex-[0_0_auto] inline-flex items-center justify-center rounded-btn-border border-2 border-main bg-main bg-opacity-10">
            {isPublic ? (
              <LockOutlined className="text-[18px] dark:text-light text-dark" />
            ) : (
              <UnlockOutlined className="text-[18px] dark:text-light text-dark" />
            )}
          </div>
          <div className="text-xl font-semibold w-full pe-10 leading-[1.2] dark:text-white text-dark">
            {name}
          </div>
        </div>
        <div className="mt-4">
          <div className="relative w-full">
            {!!image && (
              <img
                className="w-full h-full object-cover object-center rounded"
                src={`${image}`}
                alt="image"
              />
            )}
            <div className="w-full h-auto flex gap-x-1 px-3">
              <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
                <div className="text-center font-semibold">Игроки</div>
                {Math.ceil(turnsCount / 20)}
              </div>
              <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
                <div className="text-center font-semibold">Ходы</div>
                {turnsCount}
              </div>
              <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
                <div className="text-center font-semibold">Просмотры</div>
                {Math.round(turnsCount * 17)}
              </div>
            </div>
          </div>
        </div>
        {/* <div className="mt-5">
          <Search
            clsInput={'sm:py-[3px] sm:pb-[5px] text-[14px]'}
            showLabel={false}
            clsLabel={'dark:bg-dark-light'}
          />
        </div> */}
        <div className="mt-6">{!!description && description}</div>
        <div className="mt-auto text-right">
          <Button size="sm" onClick={() => router.push(`/game?hash=${hash}`)}>
            Open game
          </Button>
        </div>
      </div>
      <VerticalSplit move={move} extraClasses="game-modal__split" />
    </>
  );
};

export default GameModal;

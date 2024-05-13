'use client';
import '@/themes/game/index.scss';

import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserProvider } from '@/modules/user/contexts/UserContext';
import Loading from '@/modules/ui/components/common/Loading';
const Game = dynamic(() => import('@/modules/game/components/Game'), {
  ssr: false,
});

const GamePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageInner />
    </Suspense>
  );
};

const GamePageInner = () => {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  return (
    <>
      <div className="circle" />

      <div className="game-bg">
        {!hash ? (
          <Loading />
        ) : (
          <UserProvider hash={hash}>
            <Game hash={hash} />
          </UserProvider>
        )}
      </div>
    </>
  );
};

export default GamePage;
